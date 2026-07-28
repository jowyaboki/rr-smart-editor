import { ASTNode } from './types';

/**
 * Recursively extracts references (identifiers and property paths) from an AST node.
 */
export function extractReferences(node: ASTNode): string[] {
  const refs = new Set<string>();

  function traverse(n: ASTNode) {
    if (!n) return;

    switch (n.type) {
      case 'Identifier':
        refs.add(n.name);
        break;

      case 'MemberExpression': {
        const path = getMemberPath(n);
        if (path) {
          refs.add(path);
        } else {
          // Fallback if computed or complex path
          traverse(n.object);
          traverse(n.property);
        }
        break;
      }

      case 'UnaryExpression':
        traverse(n.argument);
        break;

      case 'BinaryExpression':
        traverse(n.left);
        traverse(n.right);
        break;

      case 'ArrayExpression':
        n.elements.forEach(traverse);
        break;

      case 'ObjectExpression':
        Object.values(n.properties).forEach(traverse);
        break;

      case 'CallExpression':
        traverse(n.callee);
        n.arguments.forEach(traverse);
        break;

      case 'ConditionalExpression':
        traverse(n.test);
        traverse(n.consequent);
        traverse(n.alternate);
        break;

      case 'Literal':
        break;
    }
  }

  traverse(node);
  return Array.from(refs);
}

/**
 * Helper to construct a dotted path string for non-computed member expressions (e.g., "layer.transform.position").
 */
function getMemberPath(node: ASTNode): string | null {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'MemberExpression') {
    const objPath = getMemberPath(node.object);
    if (!objPath) return null;

    if (!node.computed && node.property.type === 'Identifier') {
      return `${objPath}.${node.property.name}`;
    }
    if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
      return `${objPath}.${node.property.value}`;
    }
  }
  return null;
}

export class DependencyGraph {
  // Map of nodeId -> set of dependencies (other node IDs/references this node depends on)
  private dependencies = new Map<string, Set<string>>();
  // Inverse graph: dependency -> set of nodeIds that depend on it (dependents)
  private dependents = new Map<string, Set<string>>();

  /**
   * Adds or updates a node and its dependencies.
   */
  public addNode(nodeId: string, deps: string[]): void {
    // Clear existing dependencies for this node first
    const existingDeps = this.dependencies.get(nodeId);
    if (existingDeps) {
      for (const dep of existingDeps) {
        this.dependents.get(dep)?.delete(nodeId);
      }
    }

    const depSet = new Set(deps);
    this.dependencies.set(nodeId, depSet);

    for (const dep of deps) {
      if (!this.dependents.has(dep)) {
        this.dependents.set(dep, new Set());
      }
      this.dependents.get(dep)!.add(nodeId);
    }
  }

  /**
   * Removes a node from the graph.
   */
  public removeNode(nodeId: string): void {
    const deps = this.dependencies.get(nodeId);
    if (deps) {
      for (const dep of deps) {
        this.dependents.get(dep)?.delete(nodeId);
      }
    }
    this.dependencies.delete(nodeId);

    // Also remove this node from any dependents
    const depsOfThis = this.dependents.get(nodeId);
    if (depsOfThis) {
      for (const depOfThis of depsOfThis) {
        this.dependencies.get(depOfThis)?.delete(nodeId);
      }
    }
    this.dependents.delete(nodeId);
  }

  /**
   * Checks if there are any circular dependencies in the graph.
   * Returns true if a cycle is detected, false otherwise.
   */
  public hasCycle(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const deps = this.dependencies.get(node);
      if (deps) {
        for (const dep of deps) {
          // If the dependency has its own expression node, check it
          if (this.dependencies.has(dep)) {
            if (!visited.has(dep)) {
              if (dfs(dep)) return true;
            } else if (recStack.has(dep)) {
              return true;
            }
          }
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of this.dependencies.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }

    return false;
  }

  /**
   * Returns the topological evaluation order of the expression nodes.
   * Nodes with zero dependencies will be evaluated first.
   * Throws an error if a circular reference is detected.
   */
  public getEvaluationOrder(): string[] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const order: string[] = [];

    const dfs = (node: string) => {
      visited.add(node);
      recStack.add(node);

      const deps = this.dependencies.get(node);
      if (deps) {
        for (const dep of deps) {
          if (this.dependencies.has(dep)) {
            if (!visited.has(dep)) {
              dfs(dep);
            } else if (recStack.has(dep)) {
              throw new Error(`Circular dependency detected involving: ${node} -> ${dep}`);
            }
          }
        }
      }

      recStack.delete(node);
      order.push(node);
    };

    for (const node of this.dependencies.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return order;
  }

  /**
   * Returns all node IDs that are transitively affected when a specific reference/node changes.
   * Returns them in topological/evaluation order.
   */
  public getAffectedNodes(changedId: string): string[] {
    const affected = new Set<string>();
    const queue: string[] = [changedId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const nodes = this.dependents.get(current);
      if (nodes) {
        for (const node of nodes) {
          if (!affected.has(node)) {
            affected.add(node);
            queue.push(node);
          }
        }
      }
    }

    // Sort affected nodes in correct topological order
    try {
      const fullOrder = this.getEvaluationOrder();
      return fullOrder.filter((node) => affected.has(node));
    } catch {
      // In case of cycles, fallback to simple array
      return Array.from(affected);
    }
  }
}
