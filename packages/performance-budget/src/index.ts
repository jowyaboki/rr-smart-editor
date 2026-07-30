import { PerformanceBudgetConfig, BudgetEvaluationResult } from './types';

export * from './types';

export const DEFAULT_BUDGET: PerformanceBudgetConfig = {
  maxStartupTimeMs: 150,           // 150ms core boot target
  maxWarmStartupTimeMs: 30,         // 30ms warm startup target
  maxMemoryUsageMb: 120,            // 120MB maximum JS heap budget
  maxRenderLatencyMs: 16,           // 16ms render budget (60 FPS target)
  maxBundleSizeBytes: 50 * 1024,    // 50KB bundle limit
  maxInitializationTimeMs: 40,      // 40ms max module init time
  minPlaybackFps: 58,               // 58+ FPS for ultra smooth playbacks
  minTimelineFps: 55,               // 55+ FPS for timeline operations
  minCacheHitRatePercentage: 80,    // 80%+ cache hit rate
};

export class PerformanceBudgetManager {
  private config: PerformanceBudgetConfig;

  constructor(customConfig?: Partial<PerformanceBudgetConfig>) {
    this.config = { ...DEFAULT_BUDGET, ...customConfig };
  }

  /**
   * Compares measured performance values against strict subsystem budgets.
   * Raises alerts and regression warnings automatically.
   */
  public evaluate(actualMetrics: Record<string, number>): BudgetEvaluationResult {
    const warnings: string[] = [];
    let budgetExceeded = false;

    const checkLimitMax = (key: keyof PerformanceBudgetConfig, actualKey: string, name: string, unit: string) => {
      const budgetVal = this.config[key];
      const actualVal = actualMetrics[actualKey];
      if (actualVal !== undefined) {
        if (actualVal > budgetVal) {
          budgetExceeded = true;
          const pct = Math.round(((actualVal - budgetVal) / budgetVal) * 100);
          warnings.push(`[BUDGET EXCEEDED] ${name} is ${actualVal}${unit} (Budget: ${budgetVal}${unit}, +${pct}% regression)`);
        } else if (actualVal > budgetVal * 0.95) { // 5% warning margin
          warnings.push(`[WARNING] ${name} is approaching budget limit: ${actualVal}${unit} (Budget: ${budgetVal}${unit})`);
        }
      }
    };

    const checkLimitMin = (key: keyof PerformanceBudgetConfig, actualKey: string, name: string, unit: string) => {
      const budgetVal = this.config[key];
      const actualVal = actualMetrics[actualKey];
      if (actualVal !== undefined) {
        if (actualVal < budgetVal) {
          budgetExceeded = true;
          warnings.push(`[BUDGET EXCEEDED] ${name} dropped to ${actualVal}${unit} (Budget Minimum: ${budgetVal}${unit})`);
        } else if (actualVal < budgetVal * 1.02) { // 2% warning margin
          warnings.push(`[WARNING] ${name} is near budget minimum: ${actualVal}${unit} (Budget: ${budgetVal}${unit})`);
        }
      }
    };

    // Evaluate all budgets
    checkLimitMax('maxStartupTimeMs', 'coldStartupTimeMs', 'Cold Startup Time', 'ms');
    checkLimitMax('maxWarmStartupTimeMs', 'warmStartupTimeMs', 'Warm Startup Time', 'ms');
    checkLimitMax('maxMemoryUsageMb', 'memoryUsageMb', 'Memory Usage', 'MB');
    checkLimitMax('maxRenderLatencyMs', 'renderLatencyMs', 'Render Latency', 'ms');
    checkLimitMax('maxBundleSizeBytes', 'bundleSizeBytes', 'Plugin Bundle Size', 'bytes');
    checkLimitMax('maxInitializationTimeMs', 'initializationTimeMs', 'Module Initialization Time', 'ms');

    checkLimitMin('minPlaybackFps', 'playbackFps', 'Playback FPS', ' FPS');
    checkLimitMin('minTimelineFps', 'timelineFps', 'Timeline FPS', ' FPS');
    checkLimitMin('minCacheHitRatePercentage', 'cacheHitRate', 'Cache Hit Rate', '%');

    // Regression checks against a relative historical reference if supplied
    if (actualMetrics.historicalStartupTimeMs !== undefined && actualMetrics.coldStartupTimeMs !== undefined) {
      const threshold = actualMetrics.historicalStartupTimeMs * 1.15; // 15% slower
      if (actualMetrics.coldStartupTimeMs > threshold) {
        warnings.push(`[REGRESSION DETECTED] Cold startup is > 15% slower than historical reference! (${actualMetrics.coldStartupTimeMs}ms vs ${actualMetrics.historicalStartupTimeMs}ms)`);
        budgetExceeded = true;
      }
    }

    if (actualMetrics.historicalMemoryMb !== undefined && actualMetrics.memoryUsageMb !== undefined) {
      const threshold = actualMetrics.historicalMemoryMb * 1.20; // 20% higher
      if (actualMetrics.memoryUsageMb > threshold) {
        warnings.push(`[REGRESSION DETECTED] Memory Usage is > 20% higher than historical reference! (${actualMetrics.memoryUsageMb}MB vs ${actualMetrics.historicalMemoryMb}MB)`);
        budgetExceeded = true;
      }
    }

    const budgetsRecord: Record<string, number> = {};
    Object.keys(this.config).forEach((k) => {
      budgetsRecord[k] = this.config[k as keyof PerformanceBudgetConfig];
    });

    return {
      budgetExceeded,
      warnings,
      metrics: actualMetrics,
      budgets: budgetsRecord,
    };
  }
}
