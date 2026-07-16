import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { RenderStateMachine } from '../../services/RenderStateMachine';
import { renderEventBus } from '../../services/RenderEventSystem';

export class CleanupStage implements PipelineStage {
  public readonly id = 'cleanup';
  public readonly order = 110;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      await this.cleanupWorker(context);
      return;
    }

    freshJob.stage = 'cleanup';
    freshJob.progress = 99;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: CLEANUP] Cleaning temporary render frames and caches...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 99,
      stage: 'cleanup',
      log: 'Cleaning temporary render frames and caches...',
    });

    await new Promise((r) => setTimeout(r, 100));

    await this.cleanupWorker(context);

    const finalJob = await jobStorage.getJob(job.id);
    if (finalJob && finalJob.status !== 'cancelled') {
      RenderStateMachine.checkAndTransition(finalJob.status, 'completed');

      finalJob.status = 'completed';
      finalJob.stage = 'completed';
      finalJob.progress = 100;
      context.progress = 100;
      finalJob.completedAt = new Date().toISOString();
      finalJob.logs.push(`[${new Date().toISOString()}] Render pipeline completed successfully.`);

      await jobStorage.saveJob(finalJob);
      context.job = finalJob;

      renderEventBus.emit('JobCompleted', {
        jobId: job.id,
        artifacts: context.artifacts,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async cleanupWorker(context: PipelineContext) {
    const { worker, sharedServices } = context;
    const { workerService } = sharedServices;
    const workerId = worker?.id || 'local-worker-1';
    try {
      await workerService.updateWorkerStatus(workerId, 'idle');
    } catch (err) {
      context.logger.error('Failed to reset worker status to idle', err);
    }
  }
}
