import { RenderTelemetry, RenderArtifact } from '@ai-video-editor/shared';

export interface RenderEvents {
  RenderStarted: { jobId: string; workerId: string; timestamp: string };
  ProgressUpdated: {
    jobId: string;
    progress: number;
    stage: string;
    telemetry?: RenderTelemetry;
    log?: string;
    warning?: string;
  };
  WorkerAssigned: { jobId: string; workerId: string; timestamp: string };
  JobCompleted: { jobId: string; artifacts: RenderArtifact[]; timestamp: string };
  JobFailed: { jobId: string; error: string; timestamp: string };
  WorkerHeartbeat: { workerId: string; status: string; systemInfo?: any; timestamp: string };
}

export type RenderEventKey = keyof RenderEvents;
export type RenderEventHandler<T extends RenderEventKey> = (data: RenderEvents[T]) => void;

class RenderEventBus {
  private listeners: { [K in RenderEventKey]?: RenderEventHandler<K>[] } = {};

  public subscribe<K extends RenderEventKey>(event: K, handler: RenderEventHandler<K>): () => void {
    if (!this.listeners[event]) {
      (this.listeners as any)[event] = [];
    }
    (this.listeners as any)[event]!.push(handler);

    return () => {
      (this.listeners as any)[event] = (this.listeners as any)[event]?.filter(
        (h: any) => h !== handler,
      );
    };
  }

  public emit<K extends RenderEventKey>(event: K, data: RenderEvents[K]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as any)(data);
        } catch (err) {
          console.error(`Error in EventBus handler for event ${event}:`, err);
        }
      });
    }
  }

  public clearAll() {
    this.listeners = {};
  }
}

export const renderEventBus = new RenderEventBus();
