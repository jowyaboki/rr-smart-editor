import {
  LoggerService,
  MetricsService,
  TraceService,
  ProfilerService,
  HealthService,
  AlertService,
} from '@ai-video-editor/observability';

export const webLogger = new LoggerService();
export const webMetrics = new MetricsService();
export const webTracer = new TraceService();
export const webProfiler = new ProfilerService();
export const webHealth = new HealthService();
export const webAlerts = new AlertService();

// Register mock health check routines for core engines
webHealth.registerCheck('Playback Engine', async () => ({ status: 'healthy', responseTimeMs: 15, memoryBytes: 1024 * 1024 * 12 }));
webHealth.registerCheck('Timeline Engine', async () => ({ status: 'healthy', responseTimeMs: 5, memoryBytes: 1024 * 1024 * 4 }));
webHealth.registerCheck('Render Engine', async () => ({ status: 'healthy', responseTimeMs: 120, memoryBytes: 1024 * 1024 * 156 }));
webHealth.registerCheck('Expression Engine', async () => ({ status: 'healthy', responseTimeMs: 2, memoryBytes: 1024 * 1024 * 1 }));
webHealth.registerCheck('Effects Engine', async () => ({ status: 'healthy', responseTimeMs: 80, memoryBytes: 1024 * 1024 * 64 }));
webHealth.registerCheck('AI Runtime', async () => ({ status: 'healthy', responseTimeMs: 450, memoryBytes: 1024 * 1024 * 512 }));
