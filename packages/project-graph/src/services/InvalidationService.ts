import { ProjectGraph, GraphNode, NodeType } from '../types';
import { DependencyResolver } from './DependencyResolver';

export type NodeEvaluator = (node: GraphNode, resolvedDependencies: Record<string, any>) => any;

export class InvalidationService {
  private static evaluators: Record<string, NodeEvaluator> = {};

  /**
   * Register a custom compiler or evaluator for a specific node type.
   */
  public static registerEvaluator(type: NodeType, evaluator: NodeEvaluator): void {
    this.evaluators[type] = evaluator;
  }

  /**
   * Invalidate a node and all of its transitive dependents.
   * Marks them with isDirty = true and increments their version.
   * Avoids global recomputation by only setting dirty flags!
   */
  public static invalidateNode(nodeId: string, graph: ProjectGraph): Set<string> {
    const invalidatedIds = new Set<string>();

    const node = graph.nodes[nodeId];
    if (node) {
      node.state.isDirty = true;
      invalidatedIds.add(nodeId);
    }

    // Fetch all nodes that depend on this node recursively
    const transitiveDependents = DependencyResolver.getTransitiveDependents(nodeId, graph);
    for (const dependent of transitiveDependents) {
      dependent.state.isDirty = true;
      dependent.state.version++;
      invalidatedIds.add(dependent.id);
    }

    return invalidatedIds;
  }

  /**
   * Evaluates a node using lazy evaluation.
   * If a node is dirty, it will first recursively evaluate all of its dirty dependencies,
   * then invoke its registered evaluator, and cache the computed value (isDirty = false).
   */
  public static evaluateNodeIncremental(nodeId: string, graph: ProjectGraph): any {
    const node = graph.nodes[nodeId];
    if (!node) {
      throw new Error(`Node "${nodeId}" does not exist in graph.`);
    }

    // If it is clean, return the cached computedValue immediately
    if (!node.state.isDirty && node.state.computedValue !== undefined) {
      return node.state.computedValue;
    }

    // Resolve and evaluate dependencies recursively first!
    const directDependencies = DependencyResolver.getDirectDependencies(nodeId, graph);
    const resolvedDeps: Record<string, any> = {};

    for (const dep of directDependencies) {
      // Lazy evaluation: resolve dependencies on demand
      resolvedDeps[dep.id] = this.evaluateNodeIncremental(dep.id, graph);
    }

    // Evaluate current node
    const evaluator = this.evaluators[node.type];
    let computedResult = node.state.value;

    if (evaluator) {
      try {
        computedResult = evaluator(node, resolvedDeps);
      } catch (err: any) {
        console.error(`Error evaluating node "${nodeId}" of type "${node.type}":`, err);
        computedResult = { error: err.message || String(err) };
      }
    } else {
      // Default evaluator: if no evaluator is registered, we can simply substitute reference variables
      if (typeof node.state.value === 'string') {
        let valStr = node.state.value;
        for (const [depId, depVal] of Object.entries(resolvedDeps)) {
          valStr = valStr.replace(`{${depId}}`, String(depVal));
        }
        computedResult = valStr;
      }
    }

    // Cache the computed value and mark clean
    node.state.computedValue = computedResult;
    node.state.isDirty = false;

    return computedResult;
  }

  /**
   * Runs update propagation starting from a specific node, re-evaluating only the dirty sub-graph paths.
   * Returns the list of nodes that were successfully recomputed.
   */
  public static propagateUpdates(startNodeId: string, graph: ProjectGraph): string[] {
    const recomputedIds: string[] = [];

    // 1. Invalidate starting node and dependents
    const invalidated = this.invalidateNode(startNodeId, graph);
    if (invalidated.size === 0) return [];

    // 2. Fetch evaluation order topologically to make sure we evaluate in the correct dependency order
    const globalOrder = this.getEvaluationOrder(graph);

    // 3. For each node in topological order, if it is dirty and was invalidated, re-evaluate it
    for (const nodeId of globalOrder) {
      if (invalidated.has(nodeId)) {
        const node = graph.nodes[nodeId];
        if (node && node.state.isDirty) {
          this.evaluateNodeIncremental(nodeId, graph);
          recomputedIds.push(nodeId);
        }
      }
    }

    return recomputedIds;
  }

  /**
   * Help helper: Returns the evaluation order (topologically sorted node IDs).
   */
  private static getEvaluationOrder(graph: ProjectGraph): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (nodeId: string) => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);

        // Get direct dependencies
        const deps = DependencyResolver.getDirectDependencies(nodeId, graph);
        for (const dep of deps) {
          visit(dep.id);
        }

        order.push(nodeId);
      }
    };

    for (const nodeId of Object.keys(graph.nodes)) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }

    return order;
  }
}
