export type PlatformEventType =
  | 'domain'
  | 'lifecycle'
  | 'render'
  | 'workflow'
  | 'ai'
  | 'ui'
  | 'plugin';

export interface PlatformEvent<T = any> {
  id: string;
  type: PlatformEventType;
  topic: string; // e.g. "project.created"
  payload: T;
  timestamp: string;
}

export class PlatformEventSystem {
  private listeners: Map<string, Array<(event: PlatformEvent) => void>> = new Map();

  public subscribe<T = any>(topic: string, callback: (event: PlatformEvent<T>) => void): { unsubscribe: () => void } {
    const list = this.listeners.get(topic) || [];
    list.push(callback as any);
    this.listeners.set(topic, list);

    return {
      unsubscribe: () => {
        const current = this.listeners.get(topic) || [];
        this.listeners.set(topic, current.filter((cb) => cb !== callback));
      },
    };
  }

  public publish<T = any>(type: PlatformEventType, topic: string, payload: T): void {
    const event: PlatformEvent<T> = {
      id: `evt_${Math.random().toString(36).substr(2, 9)}`,
      type,
      topic,
      payload,
      timestamp: new Date().toISOString(),
    };

    const list = this.listeners.get(topic) || [];
    const catchAll = this.listeners.get('*') || [];

    for (const cb of [...list, ...catchAll]) {
      try {
        cb(event);
      } catch (err) {
        console.error(`Error in event subscriber for topic '${topic}':`, err);
      }
    }
  }
}

export const globalPlatformEventSystem = new PlatformEventSystem();
export default globalPlatformEventSystem;
