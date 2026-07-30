import { PlatformContext } from '../types';
import { globalModuleRegistry } from './ModuleRegistry';
import { globalDependencyResolver } from './DependencyResolver';
import { globalLifecycleManager } from './LifecycleManager';
import { globalDiagnosticsManager } from './DiagnosticsManager';

export class BootstrapManager {
  public async bootstrap(context: PlatformContext): Promise<void> {
    const start = Date.now();
    const modules = globalModuleRegistry.listModules();

    // Resolve dependencies topologically
    const graph = globalDependencyResolver.resolve(
      modules.map((m) => ({ id: m.manifest.id, dependencies: m.manifest.dependencies }))
    );

    if (graph.hasCycles) {
      throw new Error(`Circular dependency detected within Platform Kernel! Evaluation blocked.`);
    }

    // Initialize modules topologically
    for (const id of graph.evaluationOrder) {
      const m = globalModuleRegistry.getModule(id);
      if (m) {
        const stepStart = Date.now();
        globalLifecycleManager.transitionState(m, 'Initialized');
        await m.initialize(context);
        globalLifecycleManager.transitionState(m, 'Running');
        await m.start(context);

        globalDiagnosticsManager.recordStartupEvent(`Bootstrap Module '${m.manifest.name}'`, Date.now() - stepStart);
      }
    }

    globalDiagnosticsManager.recordStartupEvent('Complete Platform Kernel Bootstrap', Date.now() - start);
  }

  public async shutdown(context: PlatformContext): Promise<void> {
    const modules = globalModuleRegistry.listModules();
    for (const m of modules) {
      await m.stop(context);
      globalLifecycleManager.transitionState(m, 'Disposed');
    }
  }
}

export const globalBootstrapManager = new BootstrapManager();
export default globalBootstrapManager;
