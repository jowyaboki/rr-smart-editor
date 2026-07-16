import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../services/RenderEventSystem';
import { logger } from '../../utils/logger';

export class StageRunner {
  public static async run(stage: PipelineStage, context: PipelineContext): Promise<void> {
    logger.info(`[StageRunner] Starting stage: ${stage.id}`);

    // Emit StageStarted
    renderEventBus.emit('StageStarted', {
      jobId: context.job.id,
      stageId: stage.id,
      timestamp: new Date().toISOString(),
    });

    const maxRetries = stage.retryPolicy?.maxRetries || 0;
    const delayMs = stage.retryPolicy?.delayMs || 1000;
    let attempt = 0;

    while (true) {
      try {
        context.cancellationToken.throwIfCancellationRequested();
        await stage.execute(context);
        break; // Success!
      } catch (err: any) {
        attempt++;
        logger.error(`[StageRunner] Error in stage ${stage.id} (Attempt ${attempt}/${maxRetries + 1}):`, err);

        if (attempt > maxRetries || context.cancellationToken.isCancellationRequested) {
          // All retries failed or cancelled
          logger.error(`[StageRunner] Stage ${stage.id} failed permanently.`);

          // Emit StageFailed
          renderEventBus.emit('StageFailed', {
            jobId: context.job.id,
            stageId: stage.id,
            error: err.message || String(err),
            timestamp: new Date().toISOString(),
          });

          // Perform rollback if applicable
          if (stage.rollback) {
            try {
              logger.info(`[StageRunner] Executing rollback for stage ${stage.id}`);
              await stage.rollback(context);
            } catch (rollbackErr) {
              logger.error(`[StageRunner] Rollback failed for stage ${stage.id}:`, rollbackErr);
            }
          }

          throw err; // Re-throw the error to fail the pipeline
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    logger.info(`[StageRunner] Completed stage: ${stage.id}`);
    // Emit StageCompleted
    renderEventBus.emit('StageCompleted', {
      jobId: context.job.id,
      stageId: stage.id,
      timestamp: new Date().toISOString(),
    });
  }
}
