"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueSchema = exports.RenderJobSchema = exports.RenderArtifactSchema = exports.RenderMetricsSchema = exports.RenderPresetSchema = exports.RenderWorkerSchema = exports.WorkerCapabilitySchema = exports.RenderTelemetrySchema = exports.RenderPipelineStageSchema = exports.RenderStatusSchema = exports.RenderPrioritySchema = void 0;
const zod_1 = require("zod");
exports.RenderPrioritySchema = zod_1.z.enum(['low', 'normal', 'high', 'critical']);
exports.RenderStatusSchema = zod_1.z.enum(['queued', 'rendering', 'completed', 'failed', 'paused', 'cancelled']);
exports.RenderPipelineStageSchema = zod_1.z.enum([
    'validate',
    'prepare',
    'build_composition',
    'render',
    'encode',
    'generate_thumbnail',
    'cleanup',
    'completed',
    'failed',
]);
exports.RenderTelemetrySchema = zod_1.z.object({
    cpuUsage: zod_1.z.number(),
    memoryUsage: zod_1.z.number(),
    fps: zod_1.z.number(),
    etaSeconds: zod_1.z.number(),
    queueLatencyMs: zod_1.z.number(),
    workerUtilization: zod_1.z.number(),
    activeConnections: zod_1.z.number(),
    throughput: zod_1.z.number(),
});
exports.WorkerCapabilitySchema = zod_1.z.object({
    maxConcurrentJobs: zod_1.z.number().default(1),
    supportedFormats: zod_1.z.array(zod_1.z.string()),
    supportedCodecs: zod_1.z.array(zod_1.z.string()),
    gpuAcceleration: zod_1.z.boolean(),
    maxResolution: zod_1.z.object({
        width: zod_1.z.number(),
        height: zod_1.z.number(),
    }),
});
exports.RenderWorkerSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    status: zod_1.z.enum(['idle', 'busy', 'offline']),
    capabilities: exports.WorkerCapabilitySchema,
    lastHeartbeat: zod_1.z.string(),
    currentJobId: zod_1.z.string().optional(),
    systemInfo: zod_1.z.object({
        cpuUsage: zod_1.z.number(),
        memoryUsage: zod_1.z.number(),
        platform: zod_1.z.string(),
        arch: zod_1.z.string(),
    }).optional(),
});
exports.RenderPresetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    format: zod_1.z.string(),
    codec: zod_1.z.string(),
    resolution: zod_1.z.object({
        width: zod_1.z.number(),
        height: zod_1.z.number(),
    }),
    fps: zod_1.z.number(),
    audioOnly: zod_1.z.boolean(),
    settings: zod_1.z.any().optional(),
});
exports.RenderMetricsSchema = zod_1.z.object({
    durationMs: zod_1.z.number(),
    fps: zod_1.z.number(),
    cpuUsage: zod_1.z.number(),
    memoryUsage: zod_1.z.number(),
    frameCount: zod_1.z.number(),
    renderTimePerFrameMs: zod_1.z.number(),
});
exports.RenderArtifactSchema = zod_1.z.object({
    id: zod_1.z.string(),
    jobId: zod_1.z.string(),
    url: zod_1.z.string(),
    format: zod_1.z.string(),
    size: zod_1.z.number(),
    metadata: zod_1.z.object({
        previewUrl: zod_1.z.string().optional(),
        duration: zod_1.z.number().optional(),
        resolution: zod_1.z.object({
            width: zod_1.z.number(),
            height: zod_1.z.number(),
        }).optional(),
        codec: zod_1.z.string().optional(),
        settings: zod_1.z.any().optional(),
    }),
    createdAt: zod_1.z.string(),
});
exports.RenderJobSchema = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    timeline: zod_1.z.any(),
    priority: exports.RenderPrioritySchema,
    status: exports.RenderStatusSchema,
    progress: zod_1.z.number().min(0).max(100),
    error: zod_1.z.string().optional(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    startedAt: zod_1.z.string().optional(),
    completedAt: zod_1.z.string().optional(),
    workerId: zod_1.z.string().optional(),
    preset: zod_1.z.union([zod_1.z.string(), exports.RenderPresetSchema]),
    settings: zod_1.z.object({
        format: zod_1.z.string(),
        codec: zod_1.z.string(),
        resolution: zod_1.z.object({
            width: zod_1.z.number(),
            height: zod_1.z.number(),
        }),
        fps: zod_1.z.number(),
        range: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
    }),
    dependencies: zod_1.z.array(zod_1.z.string()).default([]),
    metrics: exports.RenderMetricsSchema.optional(),
    telemetry: exports.RenderTelemetrySchema.optional(),
    artifacts: zod_1.z.array(exports.RenderArtifactSchema).optional(),
    logs: zod_1.z.array(zod_1.z.string()).default([]),
    warnings: zod_1.z.array(zod_1.z.string()).default([]),
    stage: exports.RenderPipelineStageSchema.default('validate'),
});
exports.RenderQueueSchema = zod_1.z.object({
    id: zod_1.z.string(),
    status: zod_1.z.enum(['running', 'paused']),
    jobs: zod_1.z.array(exports.RenderJobSchema),
});
//# sourceMappingURL=types.js.map