import { ProjectGraph, GraphNode, GraphEdge, DependencyType } from '../types';

export class DependencyResolver {
  /**
   * Get all incoming edges for a node (who points to this node).
   */
  public static getIncomingEdges(nodeId: string, graph: ProjectGraph): GraphEdge[] {
    return Object.values(graph.edges).filter(edge => edge.targetId === nodeId);
  }

  /**
   * Get all outgoing edges for a node (who does this node point to).
   */
  public static getOutgoingEdges(nodeId: string, graph: ProjectGraph): GraphEdge[] {
    return Object.values(graph.edges).filter(edge => edge.sourceId === nodeId);
  }

  /**
   * Get nodes that the given node DIRECTLY depends on.
   * i.e., target nodes of outgoing edges.
   */
  public static getDirectDependencies(nodeId: string, graph: ProjectGraph): GraphNode[] {
    const outgoing = this.getOutgoingEdges(nodeId, graph);
    return outgoing
      .map(edge => graph.nodes[edge.targetId])
      .filter((node): node is GraphNode => !!node);
  }

  /**
   * Get nodes that DIRECTLY depend on the given node.
   * i.e., source nodes of incoming edges.
   */
  public static getDirectDependents(nodeId: string, graph: ProjectGraph): GraphNode[] {
    const incoming = this.getIncomingEdges(nodeId, graph);
    return incoming
      .map(edge => graph.nodes[edge.sourceId])
      .filter((node): node is GraphNode => !!node);
  }

  /**
   * Get all nodes that the given node depend on TRANSITIVELY (recursively).
   */
  public static getTransitiveDependencies(nodeId: string, graph: ProjectGraph): GraphNode[] {
    const visited = new Set<string>();
    const result: GraphNode[] = [];

    const recurse = (currentId: string) => {
      const deps = this.getDirectDependencies(currentId, graph);
      for (const dep of deps) {
        if (!visited.has(dep.id)) {
          visited.add(dep.id);
          result.push(dep);
          recurse(dep.id);
        }
      }
    };

    recurse(nodeId);
    return result;
  }

  /**
   * Get all nodes that depend on the given node TRANSITIVELY (recursively).
   */
  public static getTransitiveDependents(nodeId: string, graph: ProjectGraph): GraphNode[] {
    const visited = new Set<string>();
    const result: GraphNode[] = [];

    const recurse = (currentId: string) => {
      const dependents = this.getDirectDependents(currentId, graph);
      for (const dep of dependents) {
        if (!visited.has(dep.id)) {
          visited.add(dep.id);
          result.push(dep);
          recurse(dep.id);
        }
      }
    };

    recurse(nodeId);
    return result;
  }

  /**
   * Detects all cycle paths in the graph.
   * Returns a list of cyclic paths (e.g. [['A', 'B', 'C', 'A']]).
   */
  public static detectCycle(graph: ProjectGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const outgoing = this.getOutgoingEdges(nodeId, graph);
      for (const edge of outgoing) {
        const neighbor = edge.targetId;
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recStack.has(neighbor)) {
          // Cycle found! Extract the cyclic path
          const cycleStartIdx = path.indexOf(neighbor);
          if (cycleStartIdx !== -1) {
            const cyclicPath = [...path.slice(cycleStartIdx), neighbor];
            cycles.push(cyclicPath);
          }
        }
      }

      path.pop();
      recStack.delete(nodeId);
    };

    for (const nodeId of Object.keys(graph.nodes)) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }

    return cycles;
  }

  /**
   * Returns a list of path names or routes describing how Node A depends on Node B.
   */
  public static findDependencyPaths(sourceId: string, targetId: string, graph: ProjectGraph): string[][] {
    const paths: string[][] = [];
    const currentPath: string[] = [sourceId];

    const dfs = (curr: string) => {
      if (curr === targetId) {
        paths.push([...currentPath]);
        return;
      }

      const outgoing = this.getDirectDependencies(curr, graph);
      for (const node of outgoing) {
        if (!currentPath.includes(node.id)) {
          currentPath.push(node.id);
          dfs(node.id);
          currentPath.pop();
        }
      }
    };

    dfs(sourceId);
    return paths;
  }
}
