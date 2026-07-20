export type EngineHealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface EngineInfo {
  name: string;
  version: string;
  status: 'idle' | 'initialized' | 'suspended' | 'disposed';
  health: EngineHealthStatus;
  dependencies: string[];
  error?: string;
}

export interface EngineInstance {
  name: string;
  version: string;
  dependencies: string[];
  initialize: () => Promise<void>;
  suspend?: () => Promise<void>;
  resume?: () => Promise<void>;
  dispose?: () => Promise<void>;
  status: EngineInfo['status'];
  health: EngineInfo['health'];
  error?: string;
}

export class EngineRegistry {
  private engines = new Map<string, EngineInstance>();

  public registerEngine(engine: EngineInstance): void {
    if (this.engines.has(engine.name)) {
      throw new Error(`Engine with name "${engine.name}" is already registered.`);
    }
    this.engines.set(engine.name, engine);
  }

  public getEngine(name: string): EngineInstance | undefined {
    return this.engines.get(name);
  }

  public listEngines(): EngineInstance[] {
    return Array.from(this.engines.values());
  }

  public unregisterEngine(name: string): void {
    this.engines.delete(name);
  }

  public clear(): void {
    this.engines.clear();
  }
}
