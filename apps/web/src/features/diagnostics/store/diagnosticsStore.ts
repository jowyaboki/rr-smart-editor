import { create } from 'zustand';
import { LogEntry, Alert, EngineHealth, ProfilerSnapshot, Span } from '../types';

export interface DiagnosticsState {
  logs: LogEntry[];
  alerts: Alert[];
  engineHealths: EngineHealth[];
  snapshots: ProfilerSnapshot[];
  activeTraceSpans: Span[];

  // Actions
  appendLog: (log: LogEntry) => void;
  appendAlert: (alert: Alert) => void;
  setEngineHealths: (healths: EngineHealth[]) => void;
  appendSnapshot: (snapshot: ProfilerSnapshot) => void;
  setActiveTraceSpans: (spans: Span[]) => void;
  resolveAlert: (id: string) => void;
  clearAll: () => void;
}

export const useDiagnosticsStore = create<DiagnosticsState>((set) => ({
  logs: [],
  alerts: [],
  engineHealths: [],
  snapshots: [],
  activeTraceSpans: [],

  appendLog: (log) => set((state) => ({ logs: [...state.logs.slice(-499), log] })), // Cap at 500 logs for performance

  appendAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),

  setEngineHealths: (engineHealths) => set({ engineHealths }),

  appendSnapshot: (snapshot) => set((state) => ({ snapshots: [...state.snapshots, snapshot] })),

  setActiveTraceSpans: (activeTraceSpans) => set({ activeTraceSpans }),

  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
  })),

  clearAll: () => set({ logs: [], alerts: [], engineHealths: [], snapshots: [], activeTraceSpans: [] }),
}));
