import { z } from 'zod';

export interface PerformanceBudgetConfig {
  maxStartupTimeMs: number;
  maxWarmStartupTimeMs: number;
  maxMemoryUsageMb: number;
  maxRenderLatencyMs: number;
  maxBundleSizeBytes: number;
  maxInitializationTimeMs: number;
  minPlaybackFps: number;
  minTimelineFps: number;
  minCacheHitRatePercentage: number;
}

export const PerformanceBudgetConfigSchema = z.object({
  maxStartupTimeMs: z.number().positive(),
  maxWarmStartupTimeMs: z.number().positive(),
  maxMemoryUsageMb: z.number().positive(),
  maxRenderLatencyMs: z.number().positive(),
  maxBundleSizeBytes: z.number().positive(),
  maxInitializationTimeMs: z.number().positive(),
  minPlaybackFps: z.number().positive(),
  minTimelineFps: z.number().positive(),
  minCacheHitRatePercentage: z.number().min(0).max(100),
});

export interface BudgetEvaluationResult {
  budgetExceeded: boolean;
  warnings: string[];
  metrics: Record<string, number>;
  budgets: Record<string, number>;
}
