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
export declare const PerformanceMetricsSchema: z.ZodObject<{
    reactRenderTimeMs: z.ZodNumber;
    timelineRenderTimeMs: z.ZodNumber;
    compositionRebuildTimeMs: z.ZodNumber;
    assetLoadingTimeMs: z.ZodNumber;
    previewFps: z.ZodNumber;
    memoryUsageMb: z.ZodNumber;
    timestamp: z.ZodString;
}, z.core.$strip>;
export declare const CacheEntrySchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodAny;
    createdAt: z.ZodNumber;
    expiresAt: z.ZodNumber;
    sizeBytes: z.ZodNumber;
}, z.core.$strip>;
export declare const BackgroundTaskSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        pending: "pending";
        running: "running";
        completed: "completed";
        cancelled: "cancelled";
    }>;
    progress: z.ZodNumber;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export declare const BenchmarkResultSchema: z.ZodObject<{
    scenarioName: z.ZodString;
    clipCount: z.ZodNumber;
    trackCount: z.ZodNumber;
    compositionBuildTimeMs: z.ZodNumber;
    virtualizationTimeMs: z.ZodNumber;
    memoryDeltaMb: z.ZodNumber;
    fpsUnderLoad: z.ZodNumber;
    timestamp: z.ZodString;
}, z.core.$strip>;
