import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { RenderJob, RenderArtifact } from '@ai-video-editor/shared';
import { renderPluginRegistry, PipelineStage, CancellationTokenImpl } from '@ai-video-editor/render-core';
import { RenderPipeline } from '../pipeline/RenderPipeline';
import { PipelineContext } from '../pipeline/PipelineContext';
import { FileJobStorage } from '../storage/JobStorage';
import { FileQueueRepository } from '../storage/QueueRepository';
import { renderEventBus } from '../services/RenderEventSystem';
import fs from 'fs';
import path from 'path';

describe('Render Pipeline Architecture Tests', () => {
  let testStorage: FileJobStorage;
  let testRepo: FileQueueRepository;

  beforeEach(() => {
    const dbPath = path.join(__dirname, '../../../../../renders_pipeline_test_db.json');
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

  test('Successful pipeline execution - runs all stages and produces artifacts', async () => {
    const job: RenderJob = {
      id: 'pipe-job-1',
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

    const token = new CancellationTokenImpl();
    const context = new PipelineContext(job, token);

    context.sharedServices.jobStorage = testStorage;

    let pipelineCompletedEmitted = false;
    renderEventBus.subscribe('PipelineCompleted', (data) => {
      if (data.jobId === 'pipe-job-1') {
        pipelineCompletedEmitted = true;
      }
    });

    const pipeline = new RenderPipeline();
    await pipeline.execute(context);

    assert.strictEqual(pipelineCompletedEmitted, true);
    assert.strictEqual(context.progress, 100);
    assert.ok(context.artifacts.length > 0);

    const finishedJob = await testStorage.getJob('pipe-job-1');
    assert.strictEqual(finishedJob?.status, 'completed');
  });

  test('Stage Failure and Rollback - triggers rollback and throws error', async () => {
    const job: RenderJob = {
      id: 'pipe-job-fail',
      projectId: 'project-1',
      timeline: {},
      priority: 'normal',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preset: 'mp4-1080p',
      settings: { format: 'mp4', codec: 'h264', resolution: { width: 1920, height: 1080 }, fps: 30 },
      dependencies: [],
      logs: [],
      warnings: [],
      stage: 'validate',
    };

    await testStorage.saveJob(job);

    const token = new CancellationTokenImpl();
    const context = new PipelineContext(job, token);
    context.sharedServices.jobStorage = testStorage;

    let rollbackCalled = false;
    const faultyStage: PipelineStage = {
      id: 'faulty_stage',
      order: 45,
      execute: async () => {
        throw new Error('Immediate stage failure!');
      },
      rollback: async () => {
        rollbackCalled = true;
      },
    };

    renderPluginRegistry.registerStage(faultyStage);

    const pipeline = new RenderPipeline();
    await assert.rejects(async () => {
      await pipeline.execute(context);
    }, /Immediate stage failure!/);

    assert.strictEqual(rollbackCalled, true);

    renderPluginRegistry.removeStage('faulty_stage');
  });

  test('Retry Policy - retries a stage before failing', async () => {
    const job: RenderJob = {
      id: 'pipe-job-retry',
      projectId: 'project-1',
      timeline: {},
      priority: 'normal',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preset: 'mp4-1080p',
      settings: { format: 'mp4', codec: 'h264', resolution: { width: 1920, height: 1080 }, fps: 30 },
      dependencies: [],
      logs: [],
      warnings: [],
      stage: 'validate',
    };

    await testStorage.saveJob(job);

    const token = new CancellationTokenImpl();
    const context = new PipelineContext(job, token);
    context.sharedServices.jobStorage = testStorage;

    let attempts = 0;
    const retryStage: PipelineStage = {
      id: 'retry_stage',
      order: 45,
      execute: async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
      },
      retryPolicy: {
        maxRetries: 3,
        delayMs: 10,
      },
    };

    renderPluginRegistry.registerStage(retryStage);

    const pipeline = new RenderPipeline();
    await pipeline.execute(context);

    assert.strictEqual(attempts, 3);

    renderPluginRegistry.removeStage('retry_stage');
  });

  test('Cancellation - terminates execution gracefully when cancellation requested', async () => {
    const job: RenderJob = {
      id: 'pipe-job-cancel',
      projectId: 'project-1',
      timeline: {},
      priority: 'normal',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preset: 'mp4-1080p',
      settings: { format: 'mp4', codec: 'h264', resolution: { width: 1920, height: 1080 }, fps: 30 },
      dependencies: [],
      logs: [],
      warnings: [],
      stage: 'validate',
    };

    await testStorage.saveJob(job);

    const token = new CancellationTokenImpl();
    const context = new PipelineContext(job, token);
    context.sharedServices.jobStorage = testStorage;

    const cancelingStage: PipelineStage = {
      id: 'canceling_stage',
      order: 45,
      execute: async () => {
        token.cancel();
      },
    };

    renderPluginRegistry.registerStage(cancelingStage);

    const pipeline = new RenderPipeline();
    await assert.rejects(async () => {
      await pipeline.execute(context);
    }, /Operation cancelled/);

    renderPluginRegistry.removeStage('canceling_stage');
  });

  test('Custom Stage Registration and Ordering - respects custom orders', () => {
    const initialStages = renderPluginRegistry.getStages();
    const cleanupStage = initialStages.find((s) => s.id === 'cleanup');
    assert.ok(cleanupStage);

    const customStage: PipelineStage = {
      id: 'custom_pre_cleanup',
      order: 0,
      execute: async () => {},
    };

    renderPluginRegistry.insertStageBefore('cleanup', customStage);

    const updatedStages = renderPluginRegistry.getStages();
    const customIndex = updatedStages.findIndex((s) => s.id === 'custom_pre_cleanup');
    const cleanupIndex = updatedStages.findIndex((s) => s.id === 'cleanup');

    assert.ok(customIndex !== -1);
    assert.ok(cleanupIndex !== -1);
    assert.ok(customIndex < cleanupIndex);

    renderPluginRegistry.removeStage('custom_pre_cleanup');
  });
});
