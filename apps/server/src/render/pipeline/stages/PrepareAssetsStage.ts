import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { ValidationError } from '../types/errors';

export class PrepareAssetsStage implements PipelineStage {
  public readonly id = 'prepare';
  public readonly order = 20;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new ValidationError('Job was cancelled or not found');
    }

    freshJob.stage = 'prepare';
    freshJob.progress = 20;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: PREPARE] Preparing assets and scratch disk space...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 20,
      stage: 'prepare',
      log: 'Preparing assets and scratch disk space...',
    });

    await new Promise((r) => setTimeout(r, 200));
  }
}
