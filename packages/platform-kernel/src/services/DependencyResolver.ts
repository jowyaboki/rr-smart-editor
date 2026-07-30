import { DependencyGraph, DependencyNode } from '../types';

export class DependencyResolver {
  public resolve(nodes: DependencyNode[]): DependencyGraph {
    const visited: Record<string, 'visiting' | 'visited'> = {};
    const evaluationOrder: string[] = [];
    let hasCycles = false;

    const dfs = (nodeId: string) => {
      if (visited[nodeId] === 'visiting') {
        hasCycles = true;
        return;
      }
      if (visited[nodeId] === 'visited') {
        return;
      }

      visited[nodeId] = 'visiting';

      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          dfs(depId);
        }
      }

      visited[nodeId] = 'visited';
      evaluationOrder.push(nodeId);
    };

    for (const node of nodes) {
      dfs(node.id);
    }

    return {
      nodes,
      hasCycles,
      evaluationOrder,
    };
  }
}

export const globalDependencyResolver = new DependencyResolver();
export default globalDependencyResolver;
