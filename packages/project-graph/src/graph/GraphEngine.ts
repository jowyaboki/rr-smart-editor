import { ProjectGraph, GraphNode, GraphEdge, NodeType, DependencyType } from '../types';

export class GraphEngine {
  private graph: ProjectGraph;

  constructor(id: string = 'default-graph', name: string = 'Master Project Graph') {
    this.graph = {
      id,
      name,
      version: 1,
      nodes: {},
      edges: {},
    };
  }

  public getGraph(): ProjectGraph {
    return this.graph;
  }

  public setGraph(graph: ProjectGraph): void {
    this.graph = graph;
  }

  /**
   * Insert a new node into the graph.
   */
  public insertNode(node: GraphNode): void {
    if (this.graph.nodes[node.id]) {
      throw new Error(`Node with ID "${node.id}" already exists in the graph.`);
    }
    this.graph.nodes[node.id] = {
      ...node,
      state: {
        ...node.state,
        version: node.state.version || 1,
      },
      metadata: {
        ...node.metadata,
        createdAt: node.metadata.createdAt || new Date().toISOString(),
        updatedAt: node.metadata.updatedAt || new Date().toISOString(),
      },
    };
    this.graph.version++;
  }

  /**
   * Remove a node from the graph.
   * This automatically removes all edges connected (incoming and outgoing) to this node.
   */
  public removeNode(nodeId: string): void {
    if (!this.graph.nodes[nodeId]) {
      throw new Error(`Node with ID "${nodeId}" does not exist in the graph.`);
    }

    // Delete node
    delete this.graph.nodes[nodeId];

    // Delete connected edges
    for (const [edgeId, edge] of Object.entries(this.graph.edges)) {
      if (edge.sourceId === nodeId || edge.targetId === nodeId) {
        delete this.graph.edges[edgeId];
      }
    }

    this.graph.version++;
  }

  /**
   * Update a node's value and increment its version, marking it dirty.
   */
  public updateNodeValue(nodeId: string, newValue: any): void {
    const node = this.graph.nodes[nodeId];
    if (!node) {
      throw new Error(`Node with ID "${nodeId}" does not exist in the graph.`);
    }

    node.state.value = newValue;
    node.state.isDirty = true;
    node.state.version++;
    node.metadata.updatedAt = new Date().toISOString();

    this.graph.version++;
  }

  /**
   * Add a dependency edge.
   */
  public addEdge(edge: GraphEdge): void {
    if (this.graph.edges[edge.id]) {
      throw new Error(`Edge with ID "${edge.id}" already exists.`);
    }
    if (!this.graph.nodes[edge.sourceId]) {
      throw new Error(`Source node "${edge.sourceId}" does not exist.`);
    }
    if (!this.graph.nodes[edge.targetId]) {
      throw new Error(`Target node "${edge.targetId}" does not exist.`);
    }

    this.graph.edges[edge.id] = edge;
    this.graph.version++;
  }

  /**
   * Remove an edge.
   */
  public removeEdge(edgeId: string): void {
    if (!this.graph.edges[edgeId]) {
      throw new Error(`Edge with ID "${edgeId}" does not exist.`);
    }
    delete this.graph.edges[edgeId];
    this.graph.version++;
  }

  /**
   * Reconnect an edge to a new target node.
   */
  public reconnectEdge(edgeId: string, newTargetId: string): void {
    const edge = this.graph.edges[edgeId];
    if (!edge) {
      throw new Error(`Edge with ID "${edgeId}" does not exist.`);
    }
    if (!this.graph.nodes[newTargetId]) {
      throw new Error(`Target node "${newTargetId}" does not exist.`);
    }

    edge.targetId = newTargetId;
    this.graph.version++;
  }

  /**
   * Clone a sub-graph of nodes and their internal edges.
   */
  public cloneSubGraph(nodeIds: string[], idPrefix: string = 'cloned_'): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const clonedNodes: GraphNode[] = [];
    const clonedEdges: GraphEdge[] = [];

    // Map old node ID to new node ID
    const idMap: Record<string, string> = {};
    for (const oldId of nodeIds) {
      const node = this.graph.nodes[oldId];
      if (node) {
        const newId = `${idPrefix}${oldId}`;
        idMap[oldId] = newId;

        clonedNodes.push({
          ...node,
          id: newId,
          name: `${node.name} (Cloned)`,
          state: {
            ...node.state,
            isDirty: true,
            version: 1,
          },
          metadata: {
            ...node.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }

    // Clone internal edges
    for (const edge of Object.values(this.graph.edges)) {
      if (idMap[edge.sourceId] && idMap[edge.targetId]) {
        clonedEdges.push({
          id: `${idPrefix}${edge.id}`,
          sourceId: idMap[edge.sourceId],
          targetId: idMap[edge.targetId],
          type: edge.type,
          metadata: edge.metadata ? { ...edge.metadata } : undefined,
        });
      }
    }

    return { nodes: clonedNodes, edges: clonedEdges };
  }

  /**
   * Merge another graph into this one.
   */
  public mergeGraph(other: ProjectGraph): void {
    // Merge nodes
    for (const [id, node] of Object.entries(other.nodes)) {
      this.graph.nodes[id] = {
        ...node,
        state: { ...node.state },
        metadata: { ...node.metadata },
      };
    }

    // Merge edges
    for (const [id, edge] of Object.entries(other.edges)) {
      this.graph.edges[id] = {
        ...edge,
        metadata: edge.metadata ? { ...edge.metadata } : undefined,
      };
    }

    this.graph.version = Math.max(this.graph.version, other.version) + 1;
  }

  /**
   * Get the topological order of node IDs.
   * Leverages Depth-First Search. Detects cycles and throws if one is found.
   */
  public getTopologicalOrder(): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const tempVisited = new Set<string>();

    const nodes = Object.keys(this.graph.nodes);

    // Build adjacency list (sourceId -> targetIds)
    // In our dependency tracking, if Source depends_on Target, Target must evaluate BEFORE Source.
    // So edges denote: Source -> Target.
    // For topological sort, if a node A depends on B (A -> B), B must appear BEFORE A in evaluation.
    const adj: Record<string, string[]> = {};
    for (const id of nodes) {
      adj[id] = [];
    }
    for (const edge of Object.values(this.graph.edges)) {
      if (adj[edge.sourceId]) {
        adj[edge.sourceId].push(edge.targetId);
      }
    }

    const visit = (nodeId: string) => {
      if (tempVisited.has(nodeId)) {
        throw new Error(`Circular dependency detected involving node "${nodeId}".`);
      }
      if (!visited.has(nodeId)) {
        tempVisited.add(nodeId);

        const neighbors = adj[nodeId] || [];
        for (const neighbor of neighbors) {
          // Only traverse if the neighbor is still in the graph
          if (this.graph.nodes[neighbor]) {
            visit(neighbor);
          }
        }

        tempVisited.delete(nodeId);
        visited.add(nodeId);
        order.push(nodeId);
      }
    };

    for (const node of nodes) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return order; // Order of evaluation (Target node evaluated first, then Source node)
  }
}
