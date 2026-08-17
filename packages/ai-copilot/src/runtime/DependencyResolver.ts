import { ExecutionGraph, ExecutionNode } from './types';

export class DependencyResolver {
  /**
   * Sorts nodes topologically or throws error if cycle detected.
   */
  static topologicalSort(graph: ExecutionGraph): string[] {
    const nodeIds = Object.keys(graph.nodes);
    const visited = new Set<string>();
    const tempVisited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (tempVisited.has(nodeId)) {
        throw new Error(`Cyclic dependency detected in execution graph at node '${nodeId}'`);
      }
      if (!visited.has(nodeId)) {
        tempVisited.add(nodeId);
        const node = graph.nodes[nodeId];
        if (node) {
          for (const depId of node.dependencies) {
            if (graph.nodes[depId]) {
              visit(depId);
            }
          }
        }
        tempVisited.delete(nodeId);
        visited.add(nodeId);
        order.push(nodeId);
      }
    };

    for (const id of nodeIds) {
      if (!visited.has(id)) {
        visit(id);
      }
    }

    return order;
  }

  /**
   * Returns list of node IDs that are ready to execute given the set of completed nodes.
   */
  static getExecutableNodes(graph: ExecutionGraph, completedNodeIds: Set<string>, runningNodeIds: Set<string>): ExecutionNode[] {
    const readyNodes: ExecutionNode[] = [];

    for (const [id, node] of Object.entries(graph.nodes)) {
      if (completedNodeIds.has(id) || runningNodeIds.has(id)) {
        continue;
      }

      if (node.status !== 'pending') {
        continue;
      }

      const dependenciesMet = node.dependencies.every(depId => completedNodeIds.has(depId));
      if (dependenciesMet) {
        readyNodes.push(node);
      }
    }

    return readyNodes;
  }

  /**
   * Validates graph structure and dependencies integrity.
   */
  static validateGraph(graph: ExecutionGraph): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodeIds = new Set(Object.keys(graph.nodes));

    for (const [id, node] of Object.entries(graph.nodes)) {
      for (const depId of node.dependencies) {
        if (!nodeIds.has(depId)) {
          errors.push(`Node '${id}' references unknown dependency '${depId}'`);
        }
      }
    }

    try {
      this.topologicalSort(graph);
    } catch (err: any) {
      errors.push(err.message);
    }

    return { valid: errors.length === 0, errors };
  }
}
