import { PlatformModule } from '../types';

export class ModuleRegistry {
  private modules: Map<string, PlatformModule> = new Map();

  public registerModule(module: PlatformModule): void {
    if (this.modules.has(module.manifest.id)) {
      throw new Error(`PlatformModule with ID '${module.manifest.id}' is already registered.`);
    }
    this.modules.set(module.manifest.id, module);
  }

  public getModule(id: string): PlatformModule | undefined {
    return this.modules.get(id);
  }

  public listModules(): PlatformModule[] {
    return Array.from(this.modules.values());
  }
}

export const globalModuleRegistry = new ModuleRegistry();
export default globalModuleRegistry;
