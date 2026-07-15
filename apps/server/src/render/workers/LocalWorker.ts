import { RenderJob, WorkerCapability, RenderTelemetry } from '@ai-video-editor/shared';
import { RenderWorkerAdapter } from '@ai-video-editor/render-core';
import { workerService } from './WorkerService';
import { jobStorage } from '../storage/JobStorage';
import { logger } from '../../utils/logger';
import { artifactService } from '../services/ArtifactService';
import { renderEventBus } from '../services/RenderEventSystem';
import { RenderStateMachine } from '../services/RenderStateMachine';
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

    try {
      RenderStateMachine.checkAndTransition(job.status, 'rendering');

      job.status = 'rendering';
      job.startedAt = new Date().toISOString();
      job.workerId = this.id;

      renderEventBus.emit('RenderStarted', {
        jobId: job.id,
        workerId: this.id,
        timestamp: new Date().toISOString(),
      });

      await workerService.updateWorkerStatus(this.id, 'busy', job.id);

      await this.runStage(job, 'validate', 10, 'Validating project timeline and settings...', 200);
      await this.runStage(job, 'prepare', 20, 'Preparing assets and scratch disk space...', 200);
      await this.runStage(
        job,
        'build_composition',
        30,
        'Bundling Remotion code and parsing clips...',
        300,
      );

      job.stage = 'render';
      job.logs.push(`[${new Date().toISOString()}] Entering Render stage: Evaluation and rasterization`);
      await jobStorage.saveJob(job);

      const totalFrames = 100;
      const fps = job.settings.fps || 30;
      const startTime = Date.now();

      for (let frame = 1; frame <= totalFrames; frame++) {
        const current = await jobStorage.getJob(job.id);
        if (!current || current.status === 'cancelled') {
          this.cleanupAfterJob();
          return;
        }

        const elapsedMs = Date.now() - startTime;
        const renderedFps = parseFloat((frame / (elapsedMs / 1000 || 0.1)).toFixed(1));
        const remainingFrames = totalFrames - frame;
        const etaSeconds = Math.ceil(renderedFps > 0 ? remainingFrames / renderedFps : 0);

        job.progress = 30 + (frame / totalFrames) * 50;

        let warning: string | undefined = undefined;
        if (frame === 45) {
          warning = `[Warning] High complexity detected at frame 45. Memory usage is close to threshold.`;
          job.warnings.push(warning);
        }

        const logMsg = `Rendered frame ${frame}/${totalFrames} - FPS: ${renderedFps} - ETA: ${etaSeconds}s`;
        job.logs.push(`[${new Date().toISOString()}] ${logMsg}`);

        const telemetry: RenderTelemetry = {
          cpuUsage: 15 + Math.floor(Math.random() * 10),
          memoryUsage: 50 + Math.floor(Math.random() * 5),
          fps: renderedFps,
          etaSeconds,
          queueLatencyMs: Date.now() - new Date(job.createdAt).getTime(),
          workerUtilization: 100,
          activeConnections: 1,
          throughput: 20,
        };

        job.telemetry = telemetry;
        job.metrics = {
          durationMs: elapsedMs,
          fps: renderedFps,
          cpuUsage: telemetry.cpuUsage,
          memoryUsage: telemetry.memoryUsage,
          frameCount: frame,
          renderTimePerFrameMs: elapsedMs / frame,
        };

        await jobStorage.saveJob(job);

        renderEventBus.emit('ProgressUpdated', {
          jobId: job.id,
          progress: job.progress,
          stage: 'render',
          telemetry,
          log: logMsg,
          warning,
        });

        await new Promise((r) => setTimeout(r, 15));
      }

      await this.runStage(
        job,
        'encode',
        90,
        'Encoding visual frame sequences and stitching audio...',
        300,
      );
      await this.runStage(
        job,
        'generate_thumbnail',
        95,
        'Generating poster poster preview thumbnail...',
        200,
      );
      await this.runStage(
        job,
        'cleanup',
        99,
        'Cleaning temporary render frames and caches...',
        100,
      );

      const outputDir = path.join(__dirname, '../../../../uploads/renders');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const filename = `${job.id}.${job.settings.format}`;
      const outputPath = path.join(outputDir, filename);
      fs.writeFileSync(
        outputPath,
        `DUMMY RENDERED FILE FOR JOB ${job.id}. Format: ${job.settings.format}`,
        'utf8',
      );

      const artifact = await artifactService.createArtifact({
        jobId: job.id,
        url: `/uploads/renders/${filename}`,
        format: job.settings.format,
        size: 1024 * 100,
        metadata: {
          duration: totalFrames / fps,
          resolution: job.settings.resolution,
          codec: job.settings.codec,
          settings: job.settings,
        },
      });

      const finalJob = await jobStorage.getJob(job.id);
      if (finalJob && finalJob.status !== 'cancelled') {
        RenderStateMachine.checkAndTransition(finalJob.status, 'completed');

        finalJob.status = 'completed';
        finalJob.stage = 'completed';
        finalJob.progress = 100;
        finalJob.completedAt = new Date().toISOString();
        finalJob.logs.push(`[${new Date().toISOString()}] Render pipeline completed successfully.`);

        await jobStorage.saveJob(finalJob);

        renderEventBus.emit('JobCompleted', {
          jobId: job.id,
          artifacts: [artifact],
          timestamp: new Date().toISOString(),
        });
      }
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

  private async runStage(
    job: RenderJob,
    stage: typeof job.stage,
    progress: number,
    logMsg: string,
    delay: number,
  ) {
    const current = await jobStorage.getJob(job.id);
    if (!current || current.status === 'cancelled') {
      throw new Error('Job was cancelled');
    }

    job.stage = stage;
    job.progress = progress;
    job.logs.push(`[${new Date().toISOString()}] [Stage: ${stage.toUpperCase()}] ${logMsg}`);
    await jobStorage.saveJob(job);

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress,
      stage,
      log: logMsg,
    });

    await new Promise((r) => setTimeout(r, delay));
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
