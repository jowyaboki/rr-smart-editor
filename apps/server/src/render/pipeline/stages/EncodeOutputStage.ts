import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { EncodingError } from '../types/errors';
import fs from 'fs';
import path from 'path';

export class EncodeOutputStage implements PipelineStage {
  public readonly id = 'encode';
  public readonly order = 60;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new EncodingError('Job was cancelled or not found');
    }

    freshJob.stage = 'encode';
    freshJob.progress = 90;
    context.progress = 90;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: ENCODE] Encoding visual frame sequences and stitching audio...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('ProgressUpdated', {
      jobId: job.id,
      progress: 90,
      stage: 'encode',
      log: 'Encoding visual frame sequences and stitching audio...',
    });

    await new Promise((r) => setTimeout(r, 300));

    // Create the dummy rendered file
    const outputDir = path.join(__dirname, '../../../../uploads/renders');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const format = freshJob.settings.format || 'mp4';
    const filename = `${freshJob.id}.${format}`;
    const outputPath = path.join(outputDir, filename);

    fs.writeFileSync(
      outputPath,
      `DUMMY RENDERED FILE FOR JOB ${freshJob.id}. Format: ${format}`,
      'utf8',
    );

    context.temporaryFiles.push(outputPath);
  }
}
