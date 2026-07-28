import { RenderWorker, RenderJob, RenderTelemetry, RenderArtifact, WorkerCapability } from '@ai-video-editor/shared';
import { RenderWorkerAdapter, CancellationTokenImpl } from '@ai-video-editor/render-core';
import { workerService } from './WorkerService';
import { jobStorage } from '../storage/JobStorage';
import { logger } from '../../utils/logger';
import { artifactService } from '../services/ArtifactService';
import { renderEventBus } from '../services/RenderEventSystem';
import { RenderStateMachine } from '../services/RenderStateMachine';
import { PipelineContext } from '../pipeline/PipelineContext';
import { RenderPipeline } from '../pipeline/RenderPipeline';
import fs from 'fs';
import path from 'path';

export class LocalWorker implements RenderWorkerAdapter {
  public id: string;
  public name: string;
  public capabilities: WorkerCapability;
  private runningJobId?: string;
  private heartbeatInterval?: NodeJS.Timeout;
  private isProcessing: boolean = false;

  constructor(id: string = 'local-worker-1', name: string = 'Primary Local Worker') {
    this.id = id;
    this.name = name;
    this.capabilities = {
      maxConcurrentJobs: 1,
      supportedFormats: ['mp4', 'webm', 'gif', 'png', 'jpeg', 'mp3', 'wav'],
      supportedCodecs: ['h264', 'vp8', 'gif', 'png', 'jpeg', 'mp3'],
      gpuAcceleration: false,
      maxResolution: { width: 3840, height: 2160 },
    };
  }

  public async start() {
    console.log(`[DEBUG WORKER] Registering worker ${this.id}...`);
    try {
      await workerService.registerWorker({
        id: this.id,
        name: this.name,
        capabilities: this.capabilities,
        status: 'idle',
      });
      console.log(`[DEBUG WORKER] Worker ${this.id} registered successfully.`);
    } catch (err) {
      console.error(`[DEBUG WORKER] Failed to register worker ${this.id}:`, err);
      throw err;
    }

    this.heartbeatInterval = setInterval(async () => {
      try {
        const systemInfo = {
          cpuUsage: Math.floor(Math.random() * 20) + 10,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          platform: process.platform,
          arch: process.arch,
        };
        await workerService.recordHeartbeat(this.id, systemInfo, this.runningJobId);
        renderEventBus.emit('WorkerHeartbeat', {
          workerId: this.id,
          status: this.runningJobId ? 'busy' : 'idle',
          systemInfo,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`[DEBUG WORKER] Heartbeat failed:`, err);
      }
    }, 5000);

    logger.info(`LocalWorker ${this.id} started.`);
  }

  public async stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    await workerService.updateWorkerStatus(this.id, 'offline');
    logger.info(`LocalWorker ${this.id} stopped.`);
  }

  public async assignJob(jobId: string): Promise<boolean> {
    if (this.runningJobId || this.isProcessing) {
      return false;
    }

    const job = await jobStorage.getJob(jobId);
    if (!job) return false;

    this.runningJobId = jobId;
    this.isProcessing = true;

    this.executePipeline(job).catch((err) => {
      logger.error(`Error executing pipeline for job ${jobId}`, err);
    });

    return true;
  }

  private async executePipeline(job: RenderJob) {
    logger.info(`LocalWorker ${this.id} executing pipeline for job ${job.id}`);

    const cancellationToken = new CancellationTokenImpl();
    const context = new PipelineContext(job, cancellationToken, {
      id: this.id,
      name: this.name,
      capabilities: this.capabilities,
      status: 'idle',
      lastHeartbeat: new Date().toISOString(),
    });

    try {
      const pipeline = new RenderPipeline();
      await pipeline.execute(context);
    } catch (err: any) {
      logger.error(`Render pipeline failed for job ${job.id}`, err);

      const failedJob = await jobStorage.getJob(job.id);
      if (failedJob && failedJob.status !== 'cancelled') {
        try {
          RenderStateMachine.checkAndTransition(failedJob.status, 'failed');
        } catch {}

        failedJob.status = 'failed';
        failedJob.stage = 'failed';
        failedJob.error = err.message;
        failedJob.completedAt = new Date().toISOString();
        failedJob.logs.push(`[${new Date().toISOString()}] Render pipeline failed: ${err.message}`);
        await jobStorage.saveJob(failedJob);

        renderEventBus.emit('JobFailed', {
          jobId: job.id,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      this.cleanupAfterJob();
    }
  }

  private cleanupAfterJob() {
    this.runningJobId = undefined;
    this.isProcessing = false;
    workerService.updateWorkerStatus(this.id, 'idle').catch((err) => {
      logger.error('Failed to reset worker status to idle', err);
    });
  }
}

export const localWorker = new LocalWorker();
