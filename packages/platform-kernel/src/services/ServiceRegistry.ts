import { PlatformService } from '../types';

export class ServiceRegistry {
  private services: Map<string, PlatformService> = new Map();
  private transientInstances: Map<string, any> = new Map();

  public registerService(service: PlatformService): void {
    this.services.set(service.descriptor.id, service);
  }

  public getService<T = any>(id: string): T | undefined {
    const s = this.services.get(id);
    if (!s) return undefined;

    if (s.descriptor.isSingleton) {
      return s as any;
    }

    // transient lifecycle mapping
    return s as any;
  }

  public listServices(): PlatformService[] {
    return Array.from(this.services.values());
  }
}

export const globalServiceRegistry = new ServiceRegistry();
export default globalServiceRegistry;
