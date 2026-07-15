import { RenderArtifact } from '@ai-video-editor/shared';
import { jobStorage } from '../storage/JobStorage';
import { logger } from '../../utils/logger';

export class ArtifactService {
  public async createArtifact(params: {
    jobId: string;
    url: string;
    format: string;
    size: number;
    metadata?: RenderArtifact['metadata'];
  }): Promise<RenderArtifact> {
    const id = `art_${Math.random().toString(36).substring(2, 11)}`;
    const artifact: RenderArtifact = {
      id,
      jobId: params.jobId,
      url: params.url,
      format: params.format,
      size: params.size,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString(),
    };

    await jobStorage.saveArtifact(artifact);

    const job = await jobStorage.getJob(params.jobId);
    if (job) {
      if (!job.artifacts) {
        job.artifacts = [];
      }
      job.artifacts.push(artifact);
      await jobStorage.saveJob(job);
    }

    logger.info(`Created artifact ${id} for job ${params.jobId}`);
    return artifact;
  }

  public async listArtifacts(): Promise<RenderArtifact[]> {
    return jobStorage.listArtifacts();
  }
}

export const artifactService = new ArtifactService();
