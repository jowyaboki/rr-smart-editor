import { StreamingDestination, StreamingProtocol, StreamingProviderPlugin } from '../types';

export class StreamingService {
  private destinations: StreamingDestination[] = [];
  private plugins: StreamingProviderPlugin[] = [];

  constructor(initialDestinations: StreamingDestination[] = []) {
    this.destinations = initialDestinations;
  }

  public registerProviderPlugin(plugin: StreamingProviderPlugin): void {
    this.plugins.push(plugin);
  }

  public getDestinations(): StreamingDestination[] {
    return this.destinations;
  }

  public addDestination(destination: StreamingDestination): void {
    this.destinations.push(destination);
  }

  public removeDestination(id: string): void {
    this.destinations = this.destinations.filter((d) => d.id !== id);
  }

  public async startStreaming(destinationId: string): Promise<void> {
    const dest = this.destinations.find((d) => d.id === destinationId);
    if (!dest) throw new Error(`Streaming destination ${destinationId} not found.`);

    dest.status = 'connecting';

    try {
      // Look for custom plugin provider first
      const plugin = this.plugins.find((p) => p.protocol === dest.protocol);
      if (plugin) {
        await plugin.connect(dest.streamUrl, dest.streamKey);
      } else {
        // Fallback default mock connection sequence
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      dest.status = 'streaming';
      dest.errorMessage = undefined;
    } catch (err: any) {
      dest.status = 'error';
      dest.errorMessage = err?.message || 'Connection failed';
      throw err;
    }
  }

  public async stopStreaming(destinationId: string): Promise<void> {
    const dest = this.destinations.find((d) => d.id === destinationId);
    if (!dest) throw new Error(`Streaming destination ${destinationId} not found.`);

    if (dest.status !== 'streaming') return;

    try {
      const plugin = this.plugins.find((p) => p.protocol === dest.protocol);
      if (plugin) {
        await plugin.disconnect();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      dest.status = 'idle';
    } catch (err: any) {
      dest.status = 'error';
      dest.errorMessage = err?.message || 'Failed to disconnect smoothly';
      throw err;
    }
  }

  public async broadcastToAllEnabled(): Promise<void> {
    const enabled = this.destinations.filter((d) => d.isEnabled);
    await Promise.all(enabled.map((d) => this.startStreaming(d.id)));
  }

  public async stopAll(): Promise<void> {
    const active = this.destinations.filter((d) => d.status === 'streaming');
    await Promise.all(active.map((d) => this.stopStreaming(d.id)));
  }
}
