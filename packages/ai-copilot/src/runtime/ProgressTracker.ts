import { RuntimeEvent, ExecutionStatus, NodeExecutionStatus } from './types';

export type EventListener = (event: RuntimeEvent) => void;

export class ProgressTracker {
  private listeners = new Set<EventListener>();
  private eventsLog: RuntimeEvent[] = [];

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: Omit<RuntimeEvent, 'id' | 'timestamp'>): RuntimeEvent {
    const fullEvent: RuntimeEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.eventsLog.push(fullEvent);
    for (const listener of this.listeners) {
      try {
        listener(fullEvent);
      } catch (err) {
        console.error('Error in progress tracker listener:', err);
      }
    }
    return fullEvent;
  }

  getEvents(executionId?: string): RuntimeEvent[] {
    if (executionId) {
      return this.eventsLog.filter(e => e.executionId === executionId);
    }
    return [...this.eventsLog];
  }

  calculateProgressPercentage(nodeStatuses: Record<string, { status: NodeExecutionStatus }>): number {
    const entries = Object.values(nodeStatuses);
    if (entries.length === 0) return 0;
    const completedCount = entries.filter(n => n.status === 'completed' || n.status === 'skipped').length;
    return Math.round((completedCount / entries.length) * 100);
  }
}
