import { z } from 'zod';

export type RenderPriority = 'low' | 'normal' | 'high' | 'critical';

export const RenderPrioritySchema = z.enum(['low', 'normal', 'high', 'critical']);

export type RenderStatus = 'queued' | 'rendering' | 'completed' | 'failed' | 'paused' | 'cancelled';

export const RenderStatusSchema = z.enum(['queued', 'rendering', 'completed', 'failed', 'paused', 'cancelled']);

export type RenderPipelineStage =
  | 'validate'
  | 'prepare'
  | 'build_composition'
  | 'render'
  | 'encode'
  | 'generate_thumbnail'
  | 'cleanup'
  | 'completed'
  | 'failed';

export const RenderPipelineStageSchema = z.enum([
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

export interface RenderTelemetry {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  etaSeconds: number;
  queueLatencyMs: number;
  workerUtilization: number;
  activeConnections: number;
  throughput: number;
}

export const RenderTelemetrySchema = z.object({
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  fps: z.number(),
  etaSeconds: z.number(),
  queueLatencyMs: z.number(),
  workerUtilization: z.number(),
  activeConnections: z.number(),
  throughput: z.number(),
});

export interface WorkerCapability {
  maxConcurrentJobs: number;
  supportedFormats: string[];
  supportedCodecs: string[];
  gpuAcceleration: boolean;
  maxResolution: { width: number; height: number };
}

export const WorkerCapabilitySchema = z.object({
  maxConcurrentJobs: z.number().default(1),
  supportedFormats: z.array(z.string()),
  supportedCodecs: z.array(z.string()),
  gpuAcceleration: z.boolean(),
  maxResolution: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export interface RenderWorker {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'offline';
  capabilities: WorkerCapability;
  lastHeartbeat: string;
  currentJobId?: string;
  systemInfo?: {
    cpuUsage: number;
    memoryUsage: number;
    platform: string;
    arch: string;
  };
}

export const RenderWorkerSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['idle', 'busy', 'offline']),
  capabilities: WorkerCapabilitySchema,
  lastHeartbeat: z.string(),
  currentJobId: z.string().optional(),
  systemInfo: z.object({
    cpuUsage: z.number(),
    memoryUsage: z.number(),
    platform: z.string(),
    arch: z.string(),
  }).optional(),
});

export interface RenderPreset {
  id: string;
  name: string;
  description: string;
  format: string;
  codec: string;
  resolution: { width: number; height: number };
  fps: number;
  audioOnly: boolean;
  settings?: any;
}

export const RenderPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  format: z.string(),
  codec: z.string(),
  resolution: z.object({
    width: z.number(),
    height: z.number(),
  }),
  fps: z.number(),
  audioOnly: z.boolean(),
  settings: z.any().optional(),
});

export interface RenderMetrics {
  durationMs: number;
  fps: number;
  cpuUsage: number;
  memoryUsage: number;
  frameCount: number;
  renderTimePerFrameMs: number;
}

export const RenderMetricsSchema = z.object({
  durationMs: z.number(),
  fps: z.number(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  frameCount: z.number(),
  renderTimePerFrameMs: z.number(),
});

export interface RenderArtifact {
  id: string;
  jobId: string;
  url: string;
  format: string;
  size: number;
  metadata: {
    previewUrl?: string;
    duration?: number;
    resolution?: { width: number; height: number };
    codec?: string;
    settings?: any;
  };
  createdAt: string;
}

export const RenderArtifactSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  url: z.string(),
  format: z.string(),
  size: z.number(),
  metadata: z.object({
    previewUrl: z.string().optional(),
    duration: z.number().optional(),
    resolution: z.object({
      width: z.number(),
      height: z.number(),
    }).optional(),
    codec: z.string().optional(),
    settings: z.any().optional(),
  }),
  createdAt: z.string(),
});

export interface RenderJob {
  id: string;
  projectId: string;
  timeline: any;
  priority: RenderPriority;
  status: RenderStatus;
  progress: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  workerId?: string;
  preset: string | RenderPreset;
  settings: {
    format: string;
    codec: string;
    resolution: { width: number; height: number };
    fps: number;
    range?: [number, number];
  };
  dependencies: string[];
  metrics?: RenderMetrics;
  telemetry?: RenderTelemetry;
  artifacts?: RenderArtifact[];
  logs: string[];
  warnings: string[];
  stage: RenderPipelineStage;
}

export const RenderJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  timeline: z.any(),
  priority: RenderPrioritySchema,
  status: RenderStatusSchema,
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  workerId: z.string().optional(),
  preset: z.union([z.string(), RenderPresetSchema]),
  settings: z.object({
    format: z.string(),
    codec: z.string(),
    resolution: z.object({
      width: z.number(),
      height: z.number(),
    }),
    fps: z.number(),
    range: z.tuple([z.number(), z.number()]).optional(),
  }),
  dependencies: z.array(z.string()).default([]),
  metrics: RenderMetricsSchema.optional(),
  telemetry: RenderTelemetrySchema.optional(),
  artifacts: z.array(RenderArtifactSchema).optional(),
  logs: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  stage: RenderPipelineStageSchema.default('validate'),
});

export interface RenderQueue {
  id: string;
  status: 'running' | 'paused';
  jobs: RenderJob[];
}

export const RenderQueueSchema = z.object({
  id: z.string(),
  status: z.enum(['running', 'paused']),
  jobs: z.array(RenderJobSchema),
});
