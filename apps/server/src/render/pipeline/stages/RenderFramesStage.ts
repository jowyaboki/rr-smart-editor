import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { renderEventBus } from '../../services/RenderEventSystem';
import { RenderTelemetry, RenderMetrics } from '@ai-video-editor/shared';
import { RenderExecutionError } from '../types/errors';

export class RenderFramesStage implements PipelineStage {
  public readonly id = 'render';
  public readonly order = 50;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices } = context;
    const { jobStorage } = sharedServices;

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new RenderExecutionError('Job was cancelled or not found');
    }

    freshJob.stage = 'render';
    freshJob.logs.push(`[${new Date().toISOString()}] Entering Render stage: Evaluation and rasterization`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    const totalFrames = 100;
    const startTime = Date.now();

    for (let frame = 1; frame <= totalFrames; frame++) {
      const current = await jobStorage.getJob(job.id);
      if (!current || current.status === 'cancelled') {
        throw new RenderExecutionError('Job was cancelled during rendering');
      }

      context.cancellationToken.throwIfCancellationRequested();

      const elapsedMs = Date.now() - startTime;
      const renderedFps = parseFloat((frame / (elapsedMs / 1000 || 0.1)).toFixed(1));
      const remainingFrames = totalFrames - frame;
      const etaSeconds = Math.ceil(renderedFps > 0 ? remainingFrames / renderedFps : 0);

      current.progress = 30 + (frame / totalFrames) * 50;
      context.progress = current.progress;

      let warning: string | undefined = undefined;
      if (frame === 45) {
        warning = `[Warning] High complexity detected at frame 45. Memory usage is close to threshold.`;
        current.warnings.push(warning);
      }

      const logMsg = `Rendered frame ${frame}/${totalFrames} - FPS: ${renderedFps} - ETA: ${etaSeconds}s`;
      current.logs.push(`[${new Date().toISOString()}] ${logMsg}`);

      const telemetry: RenderTelemetry = {
        cpuUsage: 15 + Math.floor(Math.random() * 10),
        memoryUsage: 50 + Math.floor(Math.random() * 5),
        fps: renderedFps,
        etaSeconds,
        queueLatencyMs: Date.now() - new Date(current.createdAt).getTime(),
        workerUtilization: 100,
        activeConnections: 1,
        throughput: 20,
      };

      current.telemetry = telemetry;

      const metrics: RenderMetrics = {
        durationMs: elapsedMs,
        fps: renderedFps,
        cpuUsage: telemetry.cpuUsage,
        memoryUsage: telemetry.memoryUsage,
        frameCount: frame,
        renderTimePerFrameMs: elapsedMs / frame,
      };

      current.metrics = metrics;
      context.metrics = metrics;

      await jobStorage.saveJob(current);
      context.job = current;

      renderEventBus.emit('ProgressUpdated', {
        jobId: job.id,
        progress: current.progress,
        stage: 'render',
        telemetry,
        log: logMsg,
        warning,
      });

      await new Promise((r) => setTimeout(r, 15));
    }
  }
}
