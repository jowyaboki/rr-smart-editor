import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  LoggerService,
  MetricsService,
  TraceService,
  ProfilerService,
  HealthService,
  AlertService,
} from '../src/index';

describe('Production Monitoring & Observability Platform Core Unit Tests', () => {

  test('Structured Contextual Logging and Subscriber Syncs', () => {
    const logger = new LoggerService();
    let triggered = false;

    logger.subscribe((log) => {
      triggered = true;
      assert.strictEqual(log.level, 'error');
      assert.strictEqual(log.engine, 'Timeline Engine');
      assert.strictEqual(log.component, 'RazorSplit');
      assert.strictEqual(log.message, 'Failed to split clip: invalid offset');
      assert.strictEqual(log.correlationId, 'cor-123');
    });

    logger.log('error', 'Timeline Engine', 'RazorSplit', 'Failed to split clip: invalid offset', {
      correlationId: 'cor-123',
    });

    assert.strictEqual(triggered, true);
    assert.strictEqual(logger.getLogs().length, 1);
  });

  test('Mathematical Metrics Aggregation & Mathematical Averages', () => {
    const metrics = new MetricsService();

    // Record FPS samples
    metrics.record('fps', 30, 'Playback Engine');
    metrics.record('fps', 45, 'Playback Engine');
    metrics.record('fps', 60, 'Playback Engine');

    // Verify mathematical operations
    const avg = metrics.aggregate('fps', 'avg');
    assert.strictEqual(avg, 45); // (30+45+60)/3 = 45

    const max = metrics.aggregate('fps', 'max');
    assert.strictEqual(max, 60);

    const min = metrics.aggregate('fps', 'min');
    assert.strictEqual(min, 30);
  });

  test('Chained Span Tracings and Latency Waterfalls', () => {
    const tracer = new TraceService();

    // Start distributed trace
    const root = tracer.startTrace('trace-456', 'timeline_render', 'Render Engine', 'ExportPipeline');
    assert.strictEqual(root.traceId, 'trace-456');
    assert.strictEqual(root.name, 'timeline_render');

    // Nest async child span
    const span = tracer.startSpan('trace-456', 'gpu_blur_filter', 'Effects Engine', 'Compositor', root.id);
    assert.strictEqual(span.traceId, 'trace-456');
    assert.strictEqual(span.parentId, root.id);

    // End span
    tracer.endSpan(span.id, 'success', { blurRadius: '12' });
    assert.strictEqual(span.status, 'success');
    assert.ok(span.endTime);
    assert.strictEqual(span.tags?.blurRadius, '12');
  });

  test('Engine Heartbeat Health Evaluations', async () => {
    const health = new HealthService();

    health.registerCheck('Workflow Engine', async () => ({
      status: 'healthy',
      responseTimeMs: 8,
      memoryBytes: 1024 * 128,
    }));

    const result = await health.evaluateHealth('Workflow Engine');
    assert.strictEqual(result.engineName, 'Workflow Engine');
    assert.strictEqual(result.status, 'healthy');
    assert.strictEqual(result.responseTimeMs, 8);
    assert.ok(result.lastChecked);
  });

  test('Real-time Alerts Triggers on Latency Overruns', () => {
    const alerts = new AlertService();
    let alertTriggered = false;

    alerts.subscribe((alert) => {
      alertTriggered = true;
      assert.strictEqual(alert.severity, 'critical');
      assert.strictEqual(alert.type, 'memory_leak');
    });

    alerts.triggerAlert('critical', 'Plugin Runtime', 'memory_leak', 'Memory leak detected in plugin "CustomGlitch": growth rate 50MB/min');

    assert.strictEqual(alertTriggered, true);
    assert.strictEqual(alerts.getAlerts(false).length, 1);
  });
});
