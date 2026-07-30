import { Capability } from '../types';

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();

  public registerCapability(capability: Capability): void {
    this.capabilities.set(capability.id, capability);
  }

  public getCapability(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  public listCapabilities(): Capability[] {
    return Array.from(this.capabilities.values());
  }
}

export const globalCapabilityRegistry = new CapabilityRegistry();
export default globalCapabilityRegistry;
