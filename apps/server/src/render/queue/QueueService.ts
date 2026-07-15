import { RenderJob, RenderPriority } from '@ai-video-editor/shared';
import { queueRepository } from '../storage/QueueRepository';
import { logger } from '../../utils/logger';
import { renderPluginRegistry } from '@ai-video-editor/render-core';
import { RenderStateMachine } from '../services/RenderStateMachine';
import { renderEventBus } from '../services/RenderEventSystem';

export class QueueService {
  public async getQueueStatus(): Promise<'running' | 'paused'> {
    return queueRepository.getQueueStatus();
  }

  public async pauseQueue(): Promise<void> {
    await queueRepository.setQueueStatus('paused');
    logger.info('Render queue paused.');
  }

  public async resumeQueue(): Promise<void> {
    await queueRepository.setQueueStatus('running');
    logger.info('Render queue resumed.');
  }

  public async createJob(params: {
    projectId: string;
    timeline: any;
    priority?: RenderPriority;
    presetId?: string;
    dependencies?: string[];
    settings?: Partial<RenderJob['settings']>;
  }): Promise<RenderJob> {
    const id = `job_${Math.random().toString(36).substring(2, 11)}`;
    const priority = params.priority || 'normal';
    const presetId = params.presetId || 'mp4-1080p';
    const preset = renderPluginRegistry.getPreset(presetId) || renderPluginRegistry.getAllPresets()[0];

    const finalSettings = {
      format: params.settings?.format || preset.format,
      codec: params.settings?.codec || preset.codec,
      resolution: params.settings?.resolution || preset.resolution,
      fps: params.settings?.fps || preset.fps,
      range: params.settings?.range,
    };

    const job: RenderJob = {
      id,
      projectId: params.projectId,
      timeline: params.timeline,
      priority,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preset: presetId,
      settings: finalSettings,
      dependencies: params.dependencies || [],
      logs: [`Job enqueued with priority ${priority}`],
      warnings: [],
      stage: 'validate',
    };

    await queueRepository.saveJob(job);
    logger.info(`Created and enqueued render job ${id} (priority: ${priority})`);
    return job;
  }

  public async getJob(id: string): Promise<RenderJob | undefined> {
    return queueRepository.getJob(id);
  }

  public async listJobs(filter?: { projectId?: string; status?: string }): Promise<RenderJob[]> {
    return queueRepository.listJobs(filter);
  }

  public async cancelJob(id: string): Promise<boolean> {
    const job = await queueRepository.getJob(id);
    if (!job) return false;

    try {
      RenderStateMachine.checkAndTransition(job.status, 'cancelled');
    } catch (err) {
      return false;
    }

    job.status = 'cancelled';
    job.stage = 'failed';
    job.logs.push(`Job cancelled by user at ${new Date().toISOString()}`);
    job.completedAt = new Date().toISOString();

    await queueRepository.saveJob(job);
    logger.info(`Cancelled render job ${id}`);

    renderEventBus.emit('JobFailed', {
      jobId: job.id,
      error: 'Cancelled by user',
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  public async retryJob(id: string): Promise<boolean> {
    const job = await queueRepository.getJob(id);
    if (!job) return false;

    try {
      RenderStateMachine.checkAndTransition(job.status, 'queued');
    } catch (err) {
      return false;
    }

    job.status = 'queued';
    job.stage = 'validate';
    job.progress = 0;
    job.error = undefined;
    job.workerId = undefined;
    job.startedAt = undefined;
    job.completedAt = undefined;
    job.logs.push(`Job restarted by user at ${new Date().toISOString()}`);

    await queueRepository.saveJob(job);
    logger.info(`Retried and re-queued render job ${id}`);
    return true;
  }

  public async getNextEligibleJobs(): Promise<RenderJob[]> {
    if ((await this.getQueueStatus()) === 'paused') {
      return [];
    }

    const allJobs = await queueRepository.listJobs();
    const queuedJobs = allJobs.filter((j) => j.status === 'queued');
    const eligibleJobs: RenderJob[] = [];

    for (const job of queuedJobs) {
      let depsMet = true;
      let depFailed = false;

      for (const depId of job.dependencies) {
        const depJob = await queueRepository.getJob(depId);
        if (!depJob) {
          depsMet = false;
          depFailed = true;
          job.error = `Missing dependency job: ${depId}`;
          job.status = 'failed';
          job.stage = 'failed';
          job.logs.push(`Dependency check failed: Job ${depId} does not exist.`);
          await queueRepository.saveJob(job);
          renderEventBus.emit('JobFailed', {
            jobId: job.id,
            error: `Missing dependency job: ${depId}`,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        if (depJob.status === 'failed' || depJob.status === 'cancelled') {
          depsMet = false;
          depFailed = true;
          job.error = `Dependency job failed: ${depId}`;
          job.status = 'failed';
          job.stage = 'failed';
          job.logs.push(`Dependency check failed: Job ${depId} was ${depJob.status}.`);
          await queueRepository.saveJob(job);
          renderEventBus.emit('JobFailed', {
            jobId: job.id,
            error: `Dependency job failed: ${depId}`,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        if (depJob.status !== 'completed') {
          depsMet = false;
        }
      }

      if (depFailed) continue;

      if (depsMet) {
        eligibleJobs.push(job);
      }
    }

    return eligibleJobs;
  }
}

export const queueService = new QueueService();
