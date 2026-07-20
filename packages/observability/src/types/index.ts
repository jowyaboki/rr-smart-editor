import { z } from 'zod';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export const LogLevelSchema = z.enum(['debug', 'info', 'warning', 'error', 'critical']);

// ==========================================
// CORE PLATFORM MODELS
// ==========================================

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  engine: string;
  component: string;
  message: string;
  correlationId?: string;
  projectId?: string;
  sessionId?: string;
  duration?: number; // performance metric
}

export const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  level: LogLevelSchema,
  engine: z.string(),
  component: z.string(),
  message: z.string(),
  correlationId: z.string().optional(),
  projectId: z.string().optional(),
  sessionId: z.string().optional(),
  duration: z.number().optional(),
});

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  engine: string;
  labels?: Record<string, string>;
}

export const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  timestamp: z.number(),
  engine: z.string(),
  labels: z.record(z.string()).optional(),
});

export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  engine: string;
  component: string;
  status: 'success' | 'error';
  tags?: Record<string, string>;
}

export const SpanSchema = z.object({
  id: z.string(),
  traceId: z.string(),
  parentId: z.string().optional(),
  name: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  engine: z.string(),
  component: z.string(),
  status: z.enum(['success', 'error']),
  tags: z.record(z.string()).optional(),
});

export interface Trace {
  id: string;
  rootSpan: Span;
  spans: Span[];
}

export interface DiagnosticEvent {
  id: string;
  timestamp: number;
  name: string; // Commands, Transactions, Playback, Render, etc.
  engine: string;
  payload: any;
}

export interface PerformanceSample {
  timestamp: number;
  fps: number;
  cpuUsage: number;
  memoryUsage: number;
  longTasksCount: number;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface EngineHealth {
  engineName: string;
  status: HealthStatus;
  lastChecked: number;
  responseTimeMs: number;
  memoryBytes: number;
  error?: string;
}

export interface Alert {
  id: string;
  timestamp: number;
  severity: 'warning' | 'critical';
  engine: string;
  type: 'slow_render' | 'memory_leak' | 'worker_timeout' | 'plugin_crash' | 'expression_failure' | 'dropped_frames';
  message: string;
  resolved: boolean;
}

export interface ProfilerSnapshot {
  id: string;
  timestamp: number;
  cpuProfileSamples: number[];
  memorySnapshotBytes: number;
  durationMs: number;
  detectedLongTasks: number;
}
