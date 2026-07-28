import { useEffect } from 'react';
import { useDiagnosticsStore } from '../store/diagnosticsStore';
import { webLogger, webMetrics, webHealth, webAlerts, webProfiler, webTracer } from '../services';

export function useDiagnostics() {
  const store = useDiagnosticsStore();

  useEffect(() => {
    // Sync logs and alerts triggered by engine callbacks
    const unsubLog = webLogger.subscribe((log) => store.appendLog(log));
    const unsubAlert = webAlerts.subscribe((alert) => store.appendAlert(alert));

    return () => {
      unsubLog();
      unsubAlert();
    };
  }, []);

  const runHealthAudit = async () => {
    const healths = await webHealth.evaluateAll();
    store.setEngineHealths(healths);
    return healths;
  };

  const recordTimeMetric = (name: string, value: number, engine: string) => {
    webMetrics.record(name, value, engine);
    // Auto alert on long tasks/latency anomalies
    if (name === 'playback_latency' && value > 300) {
      webAlerts.triggerAlert('warning', engine, 'dropped_frames', `Playback latency exceeded 300ms: ${value}ms`);
    }
  };

  const captureProfileSnapshot = (cpuSamples: number[], memoryBytes: number, durationMs: number) => {
    const snapshot = webProfiler.captureSnapshot(cpuSamples, memoryBytes, durationMs);
    store.appendSnapshot(snapshot);
    return snapshot;
  };

  return {
    logs: store.logs,
    alerts: store.alerts,
    engineHealths: store.engineHealths,
    snapshots: store.snapshots,
    runHealthAudit,
    recordTimeMetric,
    captureProfileSnapshot,
  };
}
