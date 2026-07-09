export type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  subscribe<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.unsubscribe(event, handler);
  }

  unsubscribe<T>(event: string, handler: EventHandler<T>): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<T>(event: string, data: T): void {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }
}
