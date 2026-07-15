"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkResultSchema = exports.BackgroundTaskSchema = exports.CacheEntrySchema = exports.PerformanceMetricsSchema = void 0;
const zod_1 = require("zod");
// Zod schemas
exports.PerformanceMetricsSchema = zod_1.z.object({
    reactRenderTimeMs: zod_1.z.number().nonnegative(),
    timelineRenderTimeMs: zod_1.z.number().nonnegative(),
    compositionRebuildTimeMs: zod_1.z.number().nonnegative(),
    assetLoadingTimeMs: zod_1.z.number().nonnegative(),
    previewFps: zod_1.z.number().nonnegative(),
    memoryUsageMb: zod_1.z.number().nonnegative(),
    timestamp: zod_1.z.string(),
});
exports.CacheEntrySchema = zod_1.z.object({
    key: zod_1.z.string(),
    value: zod_1.z.any(),
    createdAt: zod_1.z.number(),
    expiresAt: zod_1.z.number(),
    sizeBytes: zod_1.z.number(),
});
exports.BackgroundTaskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
    progress: zod_1.z.number().min(0).max(100),
    createdAt: zod_1.z.number(),
});
exports.BenchmarkResultSchema = zod_1.z.object({
    scenarioName: zod_1.z.string(),
    clipCount: zod_1.z.number().int().positive(),
    trackCount: zod_1.z.number().int().positive(),
    compositionBuildTimeMs: zod_1.z.number().nonnegative(),
    virtualizationTimeMs: zod_1.z.number().nonnegative(),
    memoryDeltaMb: zod_1.z.number(),
    fpsUnderLoad: zod_1.z.number().nonnegative(),
    timestamp: zod_1.z.string(),
});
//# sourceMappingURL=index.js.map