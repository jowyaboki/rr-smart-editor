import { RenderJob, RenderArtifact, RenderMetrics, RenderWorker } from '@ai-video-editor/shared';
import { PipelineContext as IPipelineContext, CancellationToken } from '@ai-video-editor/render-core';
import { logger } from '../../utils/logger';
import { jobStorage } from '../storage/JobStorage';
import { workerService } from '../workers/WorkerService';
import { artifactService } from '../services/ArtifactService';

export class PipelineContext implements IPipelineContext {
  public job: RenderJob;
  public worker?: RenderWorker;
  public artifacts: RenderArtifact[] = [];
  public metrics?: RenderMetrics;
  public temporaryFiles: string[] = [];
  public progress: number = 0;
  public cancellationToken: CancellationToken;
  public logger: any;
  public sharedServices: any;

  constructor(job: RenderJob, cancellationToken: CancellationToken, worker?: RenderWorker) {
    this.job = job;
    this.cancellationToken = cancellationToken;
    this.worker = worker;
    this.logger = logger;
    this.artifacts = job.artifacts || [];
    this.metrics = job.metrics;
    this.progress = job.progress || 0;
    this.sharedServices = {
      jobStorage,
      workerService,
      artifactService,
    };
  }
}
