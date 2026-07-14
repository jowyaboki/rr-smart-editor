import { PerformanceMetrics } from '@ai-video-editor/shared';
import { PerformanceProfiler } from './PerformanceProfiler';

export class MetricsService {
  private static totalCompositionBuilds = 0;
  private static totalCacheHits = 0;
  private static totalCacheMisses = 0;

  public static recordCompositionBuild(): void {
    this.totalCompositionBuilds++;
  }

  public static recordCacheHit(): void {
    this.totalCacheHits++;
  }

  public static recordCacheMiss(): void {
    this.totalCacheMisses++;
  }

  /**
   * Compiles diagnostic performance scores.
   */
  public static compileReport() {
    const averages = PerformanceProfiler.getAverages();
    const hitRate =
      this.totalCacheHits + this.totalCacheMisses > 0
        ? Number(
            ((this.totalCacheHits / (this.totalCacheHits + this.totalCacheMisses)) * 100).toFixed(
              1,
            ),
          )
        : 100;

    return {
      averages,
      totalCompositionBuilds: this.totalCompositionBuilds,
      cacheStats: {
        hits: this.totalCacheHits,
        misses: this.totalCacheMisses,
        hitRatePercentage: hitRate,
      },
      healthScore: this.calculateHealthScore(averages, hitRate),
    };
  }

  /**
   * Evaluates overall system health score from 0 to 100.
   */
  private static calculateHealthScore(
    averages: Omit<PerformanceMetrics, 'timestamp'>,
    cacheHitRate: number,
  ): number {
    let score = 100;

    // Deduct for high render times (target <= 16ms for 60fps)
    if (averages.reactRenderTimeMs > 16)
      score -= Math.min(20, (averages.reactRenderTimeMs - 16) * 1.5);
    if (averages.timelineRenderTimeMs > 16)
      score -= Math.min(20, (averages.timelineRenderTimeMs - 16) * 1.5);

    // Deduct for slow composition rebuilds (target <= 50ms)
    if (averages.compositionRebuildTimeMs > 50)
      score -= Math.min(20, (averages.compositionRebuildTimeMs - 50) * 0.2);

    // Deduct for poor FPS
    if (averages.previewFps < 60) {
      score -= (60 - averages.previewFps) * 2;
    }

    // Deduct for high memory
    if (averages.memoryUsageMb > 250) {
      score -= Math.min(15, (averages.memoryUsageMb - 250) * 0.05);
    }

    return Math.max(10, Math.round(score));
  }
}
