import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { PipelineError } from '../types/errors';

export class GeneratePreviewStage implements PipelineStage {
  public readonly id = 'generate_preview';
  public readonly order = 80;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new PipelineError('Job was cancelled or not found', 'generate_preview');
    }

    freshJob.stage = 'generate_thumbnail';
    freshJob.progress = 97;
    context.progress = 97;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: GENERATE_PREVIEW] Generating streamable low-res preview...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 97,
      stage: 'generate_thumbnail',
      log: 'Generating streamable low-res preview...',
    });

    await new Promise((r) => setTimeout(r, 150));
  }
}
