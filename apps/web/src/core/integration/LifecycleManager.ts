import { EngineInstance, EngineRegistry } from './EngineRegistry';
import { DependencyResolver } from './DependencyResolver';

export class LifecycleManager {
  private resolver = new DependencyResolver();

  constructor(private registry: EngineRegistry) {}

  /**
   * Initializes all registered engines in correct topological order.
   */
  public async initializeAll(): Promise<void> {
    const engines = this.registry.listEngines();
    const sorted = this.resolver.resolveInitializationOrder(engines);

    for (const engine of sorted) {
      if (engine.status !== 'idle') continue;
      try {
        await engine.initialize();
        engine.status = 'initialized';
        engine.health = 'healthy';
      } catch (err: any) {
        engine.health = 'unhealthy';
        engine.error = err.message || String(err);
        throw new Error(`Engine "${engine.name}" failed initialization: ${engine.error}`);
      }
    }
  }

  /**
   * Suspends all active engines.
   */
  public async suspendAll(): Promise<void> {
    const active = this.registry.listEngines().filter(e => e.status === 'initialized');
    for (const engine of active) {
      if (engine.suspend) {
        await engine.suspend();
      }
      engine.status = 'suspended';
    }
  }

  /**
   * Resumes all suspended engines.
   */
  public async resumeAll(): Promise<void> {
    const suspended = this.registry.listEngines().filter(e => e.status === 'suspended');
    for (const engine of suspended) {
      if (engine.resume) {
        await engine.resume();
      }
      engine.status = 'initialized';
    }
  }

  /**
   * Disposes of all registered engines safely in reverse initialization order.
   */
  public async disposeAll(): Promise<void> {
    const engines = this.registry.listEngines();
    // Resolve order and reverse it for clean teardown of dependent structures
    let sorted: EngineInstance[] = [];
    try {
      sorted = this.resolver.resolveInitializationOrder(engines).reverse();
    } catch (e) {
      // Fallback in case resolver fails on circular checks
      sorted = engines.reverse();
    }

    for (const engine of sorted) {
      if (engine.dispose) {
        try {
          await engine.dispose();
        } catch (e) {
          console.error(`Error during dispose of "${engine.name}":`, e);
        }
      }
      engine.status = 'disposed';
    }
  }

  /**
   * Restarts the entire runtime system safely.
   */
  public async restart(): Promise<void> {
    await this.disposeAll();
    const engines = this.registry.listEngines();
    engines.forEach(e => {
      e.status = 'idle';
      e.health = 'healthy';
      e.error = undefined;
    });
    await this.initializeAll();
  }
}
