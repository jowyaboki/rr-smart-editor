import { LogEntry, LogLevel, Metric, Trace, Span, DiagnosticEvent, PerformanceSample, EngineHealth, Alert, ProfilerSnapshot, HealthStatus } from '../types';

// ==========================================
// 1. LOGGER SERVICE
// ==========================================
export class LoggerService {
  private logs: LogEntry[] = [];
  private onLogListeners = new Set<(entry: LogEntry) => void>();

  public log(
    level: LogLevel,
    engine: string,
    component: string,
    message: string,
    meta?: Partial<Pick<LogEntry, 'correlationId' | 'projectId' | 'sessionId' | 'duration'>>
  ): LogEntry {
    const entry: LogEntry = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      engine,
      component,
      message,
      ...meta,
    };

    this.logs.push(entry);
    this.onLogListeners.forEach(listener => listener(entry));
    return entry;
  }

  public subscribe(listener: (entry: LogEntry) => void): () => void {
    this.onLogListeners.add(listener);
    return () => this.onLogListeners.delete(listener);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }
}

// ==========================================
// 2. METRICS SERVICE
// ==========================================
export class MetricsService {
  private metrics: Metric[] = [];

  public record(
    name: string,
    value: number,
    engine: string,
    labels?: Record<string, string>
  ): Metric {
    const item: Metric = {
      name,
      value,
      timestamp: Date.now(),
      engine,
      labels,
    };
    this.metrics.push(item);
    return item;
  }

  public getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  /**
   * Computes mathematical averages or max values
   */
  public aggregate(name: string, method: 'avg' | 'max' | 'min' = 'avg'): number {
    const matches = this.getMetrics(name);
    if (matches.length === 0) return 0;

    const values = matches.map(m => m.value);
    if (method === 'max') return Math.max(...values);
    if (method === 'min') return Math.min(...values);

    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return sum / values.length;
  }
}

// ==========================================
// 3. TRACE SERVICE
// ==========================================
export class TraceService {
  private traces = new Map<string, Trace>();
  private activeSpans = new Map<string, Span>();

  public startTrace(traceId: string, rootSpanName: string, engine: string, component: string): Span {
    const rootSpan: Span = {
      id: `span-${Math.random().toString(36).substr(2, 9)}`,
      traceId,
      name: rootSpanName,
      startTime: Date.now(),
      engine,
      component,
      status: 'success',
    };

    const trace: Trace = {
      id: traceId,
      rootSpan,
      spans: [rootSpan],
    };

    this.traces.set(traceId, trace);
    this.activeSpans.set(rootSpan.id, rootSpan);
    return rootSpan;
  }

  public startSpan(traceId: string, name: string, engine: string, component: string, parentId?: string): Span {
    const span: Span = {
      id: `span-${Math.random().toString(36).substr(2, 9)}`,
      traceId,
      parentId,
      name,
      startTime: Date.now(),
      engine,
      component,
      status: 'success',
    };

    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push(span);
    }

    this.activeSpans.set(span.id, span);
    return span;
  }

  public endSpan(spanId: string, status: Span['status'] = 'success', tags?: Record<string, string>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.endTime = Date.now();
      span.status = status;
      if (tags) {
        span.tags = { ...span.tags, ...tags };
      }
      this.activeSpans.delete(spanId);
    }
  }

  public getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  public listTraces(): Trace[] {
    return Array.from(this.traces.values());
  }
}

// ==========================================
// 4. PROFILER SERVICE
// ==========================================
export class ProfilerService {
  private snapshots: ProfilerSnapshot[] = [];

  public captureSnapshot(cpuSamples: number[], memoryBytes: number, durationMs: number): ProfilerSnapshot {
    // Basic long task detector (> 50ms)
    const longTasks = cpuSamples.filter(s => s > 50).length;

    const snap: ProfilerSnapshot = {
      id: `snap-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      cpuProfileSamples: cpuSamples,
      memorySnapshotBytes: memoryBytes,
      durationMs,
      detectedLongTasks: longTasks,
    };

    this.snapshots.push(snap);
    return snap;
  }

  public getSnapshots(): ProfilerSnapshot[] {
    return [...this.snapshots];
  }
}

// ==========================================
// 5. HEALTH SERVICE
// ==========================================
export class HealthService {
  private healthChecks = new Map<string, () => Promise<Omit<EngineHealth, 'engineName' | 'lastChecked'>>>();

  public registerCheck(
    engineName: string,
    checkFn: () => Promise<Omit<EngineHealth, 'engineName' | 'lastChecked'>>
  ): void {
    this.healthChecks.set(engineName, checkFn);
  }

  public async evaluateHealth(engineName: string): Promise<EngineHealth> {
    const check = this.healthChecks.get(engineName);
    if (!check) {
      return {
        engineName,
        status: 'healthy',
        lastChecked: Date.now(),
        responseTimeMs: 0,
        memoryBytes: 0,
      };
    }

    try {
      const result = await check();
      return {
        engineName,
        lastChecked: Date.now(),
        ...result,
      };
    } catch (e: any) {
      return {
        engineName,
        status: 'unhealthy',
        lastChecked: Date.now(),
        responseTimeMs: 0,
        memoryBytes: 0,
        error: e.message || String(e),
      };
    }
  }

  public async evaluateAll(): Promise<EngineHealth[]> {
    const promises = Array.from(this.healthChecks.keys()).map(name => this.evaluateHealth(name));
    return Promise.all(promises);
  }
}

// ==========================================
// 6. ALERT SERVICE
// ==========================================
export class AlertService {
  private alerts: Alert[] = [];
  private onAlertListeners = new Set<(alert: Alert) => void>();

  public triggerAlert(
    severity: Alert['severity'],
    engine: string,
    type: Alert['type'],
    message: string
  ): Alert {
    const alert: Alert = {
      id: `alert-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      severity,
      engine,
      type,
      message,
      resolved: false,
    };

    this.alerts.push(alert);
    this.onAlertListeners.forEach(listener => listener(alert));
    return alert;
  }

  public getAlerts(resolved: boolean = false): Alert[] {
    return this.alerts.filter(a => a.resolved === resolved);
  }

  public resolveAlert(id: string): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
    }
  }

  public subscribe(listener: (alert: Alert) => void): () => void {
    this.onAlertListeners.add(listener);
    return () => this.onAlertListeners.delete(listener);
  }
}
