type EventListener = (payload: any) => void;

export class EventBridge {
  private listeners = new Map<string, Set<EventListener>>();

  /**
   * Registers a listener for a specific event
   */
  public subscribe(event: string, listener: EventListener): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set<EventListener>();
      this.listeners.set(event, set);
    }
    set.add(listener);

    return () => {
      set?.delete(listener);
      if (set?.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Publishes an event asynchronously to all subscribers
   */
  public publish(event: string, payload: any): void {
    const set = this.listeners.get(event);
    if (set) {
      // Execute asynchronously to decouple call stacks
      set.forEach(listener => {
        setTimeout(() => {
          try {
            listener(payload);
          } catch (e) {
            console.error(`EventBridge error in event "${event}":`, e);
          }
        }, 0);
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
export const eventBridge = new EventBridge();
