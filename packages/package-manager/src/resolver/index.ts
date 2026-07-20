import { DependencyNode } from '../types';

export class DependencyResolver {
  /**
   * Resolves a list of dependency nodes in safe execution order (topological sort).
   * Throws errors if circular references or conflicts are detected.
   */
  public resolve(
    nodes: DependencyNode[],
    allPackages: Record<string, DependencyNode>
  ): string[] {
    const visited = new Set<string>();
    const tempVisited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (tempVisited.has(nodeId)) {
        throw new Error(`Circular dependency detected: cycle contains "${nodeId}"`);
      }
      if (!visited.has(nodeId)) {
        tempVisited.add(nodeId);

        const node = allPackages[nodeId] || nodes.find(n => n.id === nodeId);
        if (!node) {
          throw new Error(`Missing dependency: unable to locate extension package "${nodeId}"`);
        }

        // Visit dependent children
        for (const depId of Object.keys(node.dependencies)) {
          visit(depId);
        }

        tempVisited.delete(nodeId);
        visited.add(nodeId);
        order.push(nodeId);
      }
    };

    // Begin topological traversals
    for (const node of nodes) {
      visit(node.id);
    }

    return order;
  }

  /**
   * Performs basic semver compatibility validation
   */
  public isCompatible(version: string, range: string): boolean {
    // Basic semver match placeholder
    if (range === '*' || range === 'latest') return true;
    const cleanRange = range.replace(/[\^~]/g, '');
    return version.startsWith(cleanRange.split('.')[0]);
  }
}
