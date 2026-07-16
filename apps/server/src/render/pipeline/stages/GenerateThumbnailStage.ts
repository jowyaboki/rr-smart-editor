import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { PipelineError } from '../types/errors';

export class GenerateThumbnailStage implements PipelineStage {
  public readonly id = 'generate_thumbnail';
  public readonly order = 70;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new PipelineError('Job was cancelled or not found', 'generate_thumbnail');
    }

    freshJob.stage = 'generate_thumbnail';
    freshJob.progress = 95;
    context.progress = 95;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: GENERATE_THUMBNAIL] Generating poster poster preview thumbnail...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 95,
      stage: 'generate_thumbnail',
      log: 'Generating poster poster preview thumbnail...',
    });

    await new Promise((r) => setTimeout(r, 200));
  }
}
