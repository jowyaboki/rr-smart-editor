import { RenderJob, RenderArtifact, RenderMetrics, RenderWorker } from '@ai-video-editor/shared';

export interface CancellationToken {
  readonly isCancellationRequested: boolean;
  throwIfCancellationRequested(): void;
  onCancellationRequested(callback: () => void): { dispose: () => void };
}

export interface PipelineContext {
  job: RenderJob;
  worker?: RenderWorker;
  artifacts: RenderArtifact[];
  metrics?: RenderMetrics;
  temporaryFiles: string[];
  progress: number;
  cancellationToken: CancellationToken;
  logger: any;
  sharedServices: any;
}

export interface PipelineStage {
  readonly id: string;
  readonly order: number;
  execute(context: PipelineContext): Promise<void>;
  rollback?(context: PipelineContext): Promise<void>;
  retryPolicy?: {
    maxRetries: number;
    delayMs: number;
  };
}

export interface PipelineConfig {
  enabledStages?: Record<string, boolean>;
  stageOrder?: Record<string, number>;
  conditions?: Record<string, (context: PipelineContext) => boolean | Promise<boolean>>;
}
