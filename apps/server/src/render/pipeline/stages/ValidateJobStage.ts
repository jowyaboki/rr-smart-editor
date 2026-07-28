import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { ValidationError } from '../types/errors';

export class ValidateJobStage implements PipelineStage {
  public readonly id = 'validate';
  public readonly order = 10;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new ValidationError('Job was cancelled or not found');
    }

    freshJob.stage = 'validate';
    freshJob.progress = 10;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: VALIDATE] Validating project timeline and settings...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 10,
      stage: 'validate',
      log: 'Validating project timeline and settings...',
    });

    await new Promise((r) => setTimeout(r, 200));
  }
}
