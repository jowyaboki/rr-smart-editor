import { globalModuleRegistry } from './ModuleRegistry';

export class DiagnosticsManager {
  private startupEvents: Array<{ task: string; durationMs: number; timestamp: string }> = [];

  public recordStartupEvent(task: string, durationMs: number): void {
    this.startupEvents.push({
      task,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  public getDiagnosticsTimeline(): Array<{ task: string; durationMs: number; timestamp: string }> {
    return this.startupEvents;
  }

  public getModuleDependencyGraph(): { nodes: Array<{ id: string; name: string; state: string; dependencies: string[] }> } {
    const list = globalModuleRegistry.listModules();
    const nodes = list.map((m) => ({
      id: m.manifest.id,
      name: m.manifest.name,
      state: m.state,
      dependencies: m.manifest.dependencies,
    }));

    return { nodes };
  }
}

export const globalDiagnosticsManager = new DiagnosticsManager();
export default globalDiagnosticsManager;
