import { renderPluginRegistry, PipelineConfig, PipelineContext, PipelineStage } from '@ai-video-editor/render-core';
import { StageRunner } from './StageRunner';
import { renderEventBus } from '../services/RenderEventSystem';
import { logger } from '../../utils/logger';

// Default stage implementations
import { ValidateJobStage } from './stages/ValidateJobStage';
import { PrepareAssetsStage } from './stages/PrepareAssetsStage';
import { PrepareCompositionStage } from './stages/PrepareCompositionStage';
import { AllocateWorkerStage } from './stages/AllocateWorkerStage';
import { RenderFramesStage } from './stages/RenderFramesStage';
import { EncodeOutputStage } from './stages/EncodeOutputStage';
import { GenerateThumbnailStage } from './stages/GenerateThumbnailStage';
import { GeneratePreviewStage } from './stages/GeneratePreviewStage';
import { CollectMetricsStage } from './stages/CollectMetricsStage';
import { PersistArtifactsStage } from './stages/PersistArtifactsStage';
import { CleanupStage } from './stages/CleanupStage';

export class RenderPipeline {
  private config: PipelineConfig;

  constructor(config: PipelineConfig = {}) {
    this.config = config;
    // Register defaults if they aren't already registered
    RenderPipeline.registerDefaultStages();
  }

  public static registerDefaultStages() {
    const defaults = [
      new ValidateJobStage(),
      new PrepareAssetsStage(),
      new PrepareCompositionStage(),
      new AllocateWorkerStage(),
      new RenderFramesStage(),
      new EncodeOutputStage(),
      new GenerateThumbnailStage(),
      new GeneratePreviewStage(),
      new CollectMetricsStage(),
      new PersistArtifactsStage(),
      new CleanupStage(),
    ];

    for (const stage of defaults) {
      if (!renderPluginRegistry.getStages().some((s) => s.id === stage.id)) {
        renderPluginRegistry.registerStage(stage);
      }
    }
  }

  public async execute(context: PipelineContext): Promise<void> {
    logger.info(`[RenderPipeline] Starting pipeline execution for job ${context.job.id}`);

    try {
      // Get all registered stages, sorted by order
      let stages = renderPluginRegistry.getStages();

      // Apply custom stageOrder from config if present
      if (this.config.stageOrder) {
        stages = stages.map((stage) => {
          if (this.config.stageOrder?.[stage.id] !== undefined) {
            return {
              ...stage,
              order: this.config.stageOrder[stage.id],
            } as PipelineStage;
          }
          return stage;
        });
        // Re-sort after applying custom order
        stages.sort((a, b) => a.order - b.order);
      }

      for (const stage of stages) {
        context.cancellationToken.throwIfCancellationRequested();

        // 1. Check if stage is enabled
        const isEnabled = this.config.enabledStages?.[stage.id] ?? true;
        if (!isEnabled) {
          logger.info(`[RenderPipeline] Stage ${stage.id} is disabled. Skipping.`);
          continue;
        }

        // 2. Check conditional execution
        const condition = this.config.conditions?.[stage.id];
        if (condition) {
          const shouldExecute = await condition(context);
          if (!shouldExecute) {
            logger.info(`[RenderPipeline] Stage ${stage.id} condition returned false. Skipping.`);
            continue;
          }
        }

        // 3. Execute the stage
        await StageRunner.run(stage, context);
      }

      logger.info(`[RenderPipeline] Pipeline completed successfully for job ${context.job.id}`);

      // Emit PipelineCompleted
      renderEventBus.emit('PipelineCompleted', {
        jobId: context.job.id,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`[RenderPipeline] Pipeline failed for job ${context.job.id}:`, err);

      // Emit PipelineFailed
      renderEventBus.emit('PipelineFailed', {
        jobId: context.job.id,
        error: err.message || String(err),
        timestamp: new Date().toISOString(),
      });

      throw err; // Propagate error
    }
  }
}
