import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { RenderJob, RenderWorker } from '@ai-video-editor/shared';
import { RenderStateMachine } from '../services/RenderStateMachine';
import { renderEventBus } from '../services/RenderEventSystem';
import { jobStorage, FileJobStorage } from '../storage/JobStorage';
import { FileQueueRepository } from '../storage/QueueRepository';
import {
  FIFOSchedulingStrategy,
  PrioritySchedulingStrategy,
  LeastBusyWorkerSchedulingStrategy,
} from '../scheduler/SchedulingStrategy';
import { LocalWorker } from '../workers/LocalWorker';
import { RenderScheduler } from '../scheduler/RenderScheduler';
import { queueService } from '../queue/QueueService';
import { workerService } from '../workers/WorkerService';
import fs from 'fs';
import path from 'path';

describe('Cloud Rendering & Distributed Render Queue Tests', () => {
  let testStorage: FileJobStorage;
  let testRepo: FileQueueRepository;

  beforeEach(() => {
    // Initialize isolated file-based database for tests
    const dbPath = path.join(__dirname, '../../../../../renders_test_db.json');
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch {}
    }
    testStorage = new FileJobStorage(dbPath);
    testStorage.clear();
    testRepo = new FileQueueRepository(testStorage);
    renderEventBus.clearAll();
  });

  test('RenderStateMachine - enforces valid and invalid transitions', () => {
    // 1. Valid transitions
    assert.strictEqual(RenderStateMachine.validateTransition('queued', 'rendering'), true);
    assert.strictEqual(RenderStateMachine.validateTransition('rendering', 'completed'), true);
    assert.strictEqual(RenderStateMachine.validateTransition('rendering', 'failed'), true);
    assert.strictEqual(RenderStateMachine.validateTransition('queued', 'cancelled'), true);
    assert.strictEqual(RenderStateMachine.validateTransition('failed', 'queued'), true); // Retry

    // 2. Invalid transitions
    assert.strictEqual(RenderStateMachine.validateTransition('completed', 'rendering'), false);
    assert.strictEqual(RenderStateMachine.validateTransition('failed', 'completed'), false);
    assert.strictEqual(RenderStateMachine.validateTransition('cancelled', 'rendering'), false);

    // 3. Exception checking
    assert.throws(() => {
      RenderStateMachine.checkAndTransition('completed', 'rendering');
    }, /Invalid state transition/);
  });

  test('RenderEventSystem - emits and receives fully-typed events', () => {
    let triggeredStart = false;
    let progressValue = 0;
    let completedJobId = '';

    renderEventBus.subscribe('RenderStarted', (data) => {
      if (data.jobId === 'job-1') {
        triggeredStart = true;
      }
    });

    renderEventBus.subscribe('ProgressUpdated', (data) => {
      if (data.jobId === 'job-1') {
        progressValue = data.progress;
      }
    });

    renderEventBus.subscribe('JobCompleted', (data) => {
      completedJobId = data.jobId;
    });

    renderEventBus.emit('RenderStarted', {
      jobId: 'job-1',
      workerId: 'worker-1',
      timestamp: new Date().toISOString(),
    });

    renderEventBus.emit('ProgressUpdated', {
      jobId: 'job-1',
      progress: 45,
      stage: 'render',
    });

    renderEventBus.emit('JobCompleted', {
      jobId: 'job-1',
      artifacts: [],
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(triggeredStart, true);
    assert.strictEqual(progressValue, 45);
    assert.strictEqual(completedJobId, 'job-1');
  });

  test('QueuePersistence & Repository - saves, restores, and list jobs correctly', async () => {
    const job: RenderJob = {
      id: 'job-1',
      projectId: 'project-1',
      timeline: {},
      priority: 'high',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preset: 'mp4-1080p',
      settings: {
        format: 'mp4',
        codec: 'h264',
        resolution: { width: 1920, height: 1080 },
        fps: 30,
      },
      dependencies: [],
      logs: [],
      warnings: [],
      stage: 'validate',
    };

    await testRepo.saveJob(job);

    const restored = await testRepo.getJob('job-1');
    assert.ok(restored);
    assert.strictEqual(restored.priority, 'high');
    assert.strictEqual(restored.status, 'queued');

    // Update state via repo
    await testRepo.updateJobStatus('job-1', 'rendering');
    const updated = await testRepo.getJob('job-1');
    assert.strictEqual(updated?.status, 'rendering');

    // Check list
    const list = await testRepo.listJobs();
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, 'job-1');
  });

  test('SchedulingStrategy - FIFOSchedulingStrategy', async () => {
    const strategy = new FIFOSchedulingStrategy();

    const jobs: RenderJob[] = [
      {
        id: 'job-early',
        priority: 'low',
        createdAt: '2024-01-01T10:00:00.000Z',
        settings: { format: 'mp4' },
      } as any,
      {
        id: 'job-late',
        priority: 'critical',
        createdAt: '2024-01-01T11:00:00.000Z',
        settings: { format: 'mp4' },
      } as any,
    ];

    const workers: RenderWorker[] = [
      {
        id: 'worker-1',
        status: 'idle',
        capabilities: { supportedFormats: ['mp4'] },
      } as any,
    ];

    const match = await strategy.selectJob(jobs, workers);
    assert.ok(match);
    assert.strictEqual(match.job.id, 'job-early'); // Older job chosen first despite lower priority
  });

  test('SchedulingStrategy - PrioritySchedulingStrategy', async () => {
    const strategy = new PrioritySchedulingStrategy();

    const jobs: RenderJob[] = [
      {
        id: 'job-low',
        priority: 'low',
        createdAt: '2024-01-01T10:00:00.000Z',
        settings: { format: 'mp4' },
      } as any,
      {
        id: 'job-critical',
        priority: 'critical',
        createdAt: '2024-01-01T11:00:00.000Z',
        settings: { format: 'mp4' },
      } as any,
    ];

    const workers: RenderWorker[] = [
      {
        id: 'worker-1',
        status: 'idle',
        capabilities: { supportedFormats: ['mp4'] },
      } as any,
    ];

    const match = await strategy.selectJob(jobs, workers);
    assert.ok(match);
    assert.strictEqual(match.job.id, 'job-critical'); // Highest priority first
  });

  test('SchedulingStrategy - LeastBusyWorkerSchedulingStrategy', async () => {
    const strategy = new LeastBusyWorkerSchedulingStrategy();

    const jobs: RenderJob[] = [
      {
        id: 'job-mp4',
        priority: 'normal',
        createdAt: '2024-01-01T10:00:00.000Z',
        settings: { format: 'mp4' },
      } as any,
    ];

    // Two active workers: worker-1 is busy, worker-2 is idle (least busy)
    const workers: RenderWorker[] = [
      {
        id: 'worker-1',
        status: 'busy',
        capabilities: { supportedFormats: ['mp4'] },
      } as any,
      {
        id: 'worker-2',
        status: 'idle',
        capabilities: { supportedFormats: ['mp4'] },
      } as any,
    ];

    const match = await strategy.selectJob(jobs, workers);
    assert.ok(match);
    assert.strictEqual(match.workerId, 'worker-2'); // Assigns to least busy worker-2
  });
});
