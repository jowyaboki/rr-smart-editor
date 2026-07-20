import { EngineInstance } from './EngineRegistry';

export class DependencyResolver {
  /**
   * Sorts the registered engines in their correct initialization order using topological sort.
   * Throws errors if circular references are detected.
   */
  public resolveInitializationOrder(engines: EngineInstance[]): EngineInstance[] {
    const visited = new Set<string>();
    const tempVisited = new Set<string>();
    const ordered: EngineInstance[] = [];

    const visit = (engine: EngineInstance) => {
      if (tempVisited.has(engine.name)) {
        throw new Error(`Circular dependency detected: cycle contains engine "${engine.name}"`);
      }
      if (!visited.has(engine.name)) {
        tempVisited.add(engine.name);

        for (const depName of engine.dependencies) {
          const depInstance = engines.find(e => e.name === depName);
          if (!depInstance) {
            throw new Error(`Missing dependency: engine "${engine.name}" depends on unregistered engine "${depName}"`);
          }
          visit(depInstance);
        }

        tempVisited.delete(engine.name);
        visited.add(engine.name);
        ordered.push(engine);
      }
    };

    for (const e of engines) {
      visit(e);
    }

    return ordered;
  }
}
