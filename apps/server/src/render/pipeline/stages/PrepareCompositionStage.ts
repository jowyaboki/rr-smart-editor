import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { ValidationError } from '../types/errors';

export class PrepareCompositionStage implements PipelineStage {
  public readonly id = 'build_composition';
  public readonly order = 30;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new ValidationError('Job was cancelled or not found');
    }

    freshJob.stage = 'build_composition';
    freshJob.progress = 30;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: BUILD_COMPOSITION] Bundling Remotion code and parsing clips...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 30,
      stage: 'build_composition',
      log: 'Bundling Remotion code and parsing clips...',
    });

    await new Promise((r) => setTimeout(r, 300));
  }
}
