import { PlatformContext, StartupPhase } from '../types';
import { globalModuleRegistry } from './ModuleRegistry';
import { globalDependencyResolver } from './DependencyResolver';
import { globalLifecycleManager } from './LifecycleManager';
import { globalDiagnosticsManager } from './DiagnosticsManager';

const PHASES: StartupPhase[] = ['CORE', 'USER_VISIBLE', 'BACKGROUND', 'OPTIONAL', 'ON_DEMAND'];

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

    // Initialize and start modules topologically in 5 strict sequential phases!
    for (const phase of PHASES) {
      const phaseStart = Date.now();
      let bootedInPhaseCount = 0;

      for (const id of graph.evaluationOrder) {
        const m = globalModuleRegistry.getModule(id);
        if (m) {
          // Resolve module phase priority, defaulting to CORE for backward-compatibility
          const mPhase = m.manifest.priority || 'CORE';
          if (mPhase === phase) {
            const stepStart = Date.now();
            globalLifecycleManager.transitionState(m, 'Initialized');
            await m.initialize(context);
            globalLifecycleManager.transitionState(m, 'Running');
            await m.start(context);

            bootedInPhaseCount++;
            globalDiagnosticsManager.recordStartupEvent(`Bootstrap Module '${m.manifest.name}'`, Date.now() - stepStart);
          }
        }
      }

      if (bootedInPhaseCount > 0) {
        globalDiagnosticsManager.recordStartupEvent(`Complete Phase ${phase} Bootstrap`, Date.now() - phaseStart);
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
