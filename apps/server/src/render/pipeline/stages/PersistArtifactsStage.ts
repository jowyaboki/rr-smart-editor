import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { ArtifactPersistenceError } from '../types/errors';

export class PersistArtifactsStage implements PipelineStage {
  public readonly id = 'persist_artifacts';
  public readonly order = 100;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage, artifactService } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new ArtifactPersistenceError('Job was cancelled or not found');
    }

    freshJob.stage = 'generate_thumbnail';
    freshJob.progress = 99;
    context.progress = 99;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: PERSIST_ARTIFACTS] Creating and persisting render artifacts...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    const format = freshJob.settings.format || 'mp4';
    const filename = `${freshJob.id}.${format}`;
    const fps = freshJob.settings.fps || 30;

    const artifact = await artifactService.createArtifact({
      jobId: freshJob.id,
      url: `/uploads/renders/${filename}`,
      format,
      size: 1024 * 100,
      metadata: {
        duration: 100 / fps,
        resolution: freshJob.settings.resolution,
        codec: freshJob.settings.codec,
        settings: freshJob.settings,
      },
    });

    context.artifacts.push(artifact);

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 99,
      stage: 'generate_thumbnail',
      log: 'Creating and persisting render artifacts...',
    });

    await new Promise((r) => setTimeout(r, 100));
  }
}
