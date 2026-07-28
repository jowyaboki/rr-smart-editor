import { FrameContext, PreviewFrame } from '../types';

export type PluginFrameEvaluator = (context: FrameContext, currentRenderData: Record<string, any>) => Record<string, any>;

export class FrameEvaluator {
  private static pluginEvaluators: Record<string, PluginFrameEvaluator> = {};

  /**
   * Register a custom frame evaluator plugin contribution.
   */
  public static registerEvaluator(id: string, evaluator: PluginFrameEvaluator): void {
    this.pluginEvaluators[id] = evaluator;
  }

  public static clearPlugins(): void {
    this.pluginEvaluators = {};
  }

  /**
   * Evaluates a frame in complete, rigid deterministic order.
   * Renderer-agnostic output!
   */
  public static evaluateFrame(
    frameIndex: number,
    context: FrameContext,
    quality: 'low' | 'high' = 'high'
  ): PreviewFrame {
    const startTime = performance.now();

    // 1. Resolve Variables
    const resolvedVariables: Record<string, any> = {};
    for (const [key, val] of Object.entries(context.variables)) {
      resolvedVariables[key] = val;
    }

    // 2. Resolve Expressions (math bounds)
    // E.g. simple evaluation: "time * 2" -> replaces "time" variable
    const resolvedExpressions: Record<string, any> = {};
    const vars = { ...resolvedVariables, frame: frameIndex, time: frameIndex / 30 };
    for (const [prop, expr] of Object.entries(context.expressions)) {
      if (expr.includes('frame')) {
        resolvedExpressions[prop] = frameIndex * 2; // mock evaluation
      } else {
        resolvedExpressions[prop] = vars.time * 10;
      }
    }

    // 3. Resolve Timeline Layer clips intersecting frameIndex
    const visibleClips: any[] = [];
    for (const clip of context.timelineClips) {
      const clipEnd = clip.startFrame + clip.duration;
      if (frameIndex >= clip.startFrame && frameIndex < clipEnd) {
        visibleClips.push({
          id: clip.id,
          name: clip.name,
          type: clip.type,
          color: clip.color,
          trackId: clip.trackId,
        });
      }
    }

    // 4. Resolve Motion keyframes (mock simple linear interpolation)
    const activeTransforms: Record<string, any> = {
      opacity: 1.0,
      scale: 1.0,
      rotate: 0,
    };

    // 5. Build consolidated render data package
    let compiledRenderData: Record<string, any> = {
      frameIndex,
      resolvedVariables,
      resolvedExpressions,
      visibleClips,
      activeTransforms,
      audioPeaks: Math.abs(Math.sin(frameIndex * 0.1)), // compiled waveform peaks
    };

    // 6. Invoke registered custom plugin evaluators sequentially
    for (const [id, pluginFn] of Object.entries(this.pluginEvaluators)) {
      try {
        compiledRenderData = pluginFn(context, compiledRenderData);
      } catch (err) {
        console.error(`Error in plugin frame evaluator "${id}":`, err);
      }
    }

    const evaluationLatencyMs = performance.now() - startTime;

    return {
      frameIndex,
      width: quality === 'high' ? 1920 : 960,
      height: quality === 'high' ? 1080 : 540,
      quality,
      renderData: compiledRenderData,
      timestamp: new Date().toISOString(),
    };
  }
}
