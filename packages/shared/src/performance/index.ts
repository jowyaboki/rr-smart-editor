import { z } from 'zod';

export interface PerformanceMetrics {
  reactRenderTimeMs: number;
  timelineRenderTimeMs: number;
  compositionRebuildTimeMs: number;
  assetLoadingTimeMs: number;
  previewFps: number;
  memoryUsageMb: number;
  timestamp: string;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  sizeBytes: number;
}

export interface BackgroundTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: number;
}

export interface BenchmarkResult {
  scenarioName: string;
  clipCount: number;
  trackCount: number;
  compositionBuildTimeMs: number;
  virtualizationTimeMs: number;
  memoryDeltaMb: number;
  fpsUnderLoad: number;
  timestamp: string;
}

// Zod schemas
export const PerformanceMetricsSchema = z.object({
  reactRenderTimeMs: z.number().nonnegative(),
  timelineRenderTimeMs: z.number().nonnegative(),
  compositionRebuildTimeMs: z.number().nonnegative(),
  assetLoadingTimeMs: z.number().nonnegative(),
  previewFps: z.number().nonnegative(),
  memoryUsageMb: z.number().nonnegative(),
  timestamp: z.string(),
});

export const CacheEntrySchema = z.object({
  key: z.string(),
  value: z.any(),
  createdAt: z.number(),
  expiresAt: z.number(),
  sizeBytes: z.number(),
});

export const BackgroundTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  progress: z.number().min(0).max(100),
  createdAt: z.number(),
});

export const BenchmarkResultSchema = z.object({
  scenarioName: z.string(),
  clipCount: z.number().int().positive(),
  trackCount: z.number().int().positive(),
  compositionBuildTimeMs: z.number().nonnegative(),
  virtualizationTimeMs: z.number().nonnegative(),
  memoryDeltaMb: z.number(),
  fpsUnderLoad: z.number().nonnegative(),
  timestamp: z.string(),
});
