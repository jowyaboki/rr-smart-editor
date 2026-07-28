import { ProjectGraph, GraphSnapshot, GraphDiff, GraphNode, GraphEdge } from '../types';

export class SnapshotService {
  private static snapshots: Record<string, GraphSnapshot[]> = {};

  /**
   * Take a deep-cloned snapshot of the current project graph.
   */
  public static createSnapshot(graph: ProjectGraph, description?: string): GraphSnapshot {
    const clonedGraph: ProjectGraph = JSON.parse(JSON.stringify(graph));
    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const snapshot: GraphSnapshot = {
      id: snapshotId,
      graphId: graph.id,
      timestamp: new Date().toISOString(),
      version: graph.version,
      graph: clonedGraph,
      description,
    };

    if (!this.snapshots[graph.id]) {
      this.snapshots[graph.id] = [];
    }
    this.snapshots[graph.id].push(snapshot);

    return snapshot;
  }

  /**
   * Restore graph state from a snapshot.
   */
  public static restoreSnapshot(snapshot: GraphSnapshot): ProjectGraph {
    // Deep clone before returning to avoid side-effects
    return JSON.parse(JSON.stringify(snapshot.graph));
  }

  /**
   * Get all snapshots for a specific graph.
   */
  public static getSnapshots(graphId: string): GraphSnapshot[] {
    return this.snapshots[graphId] || [];
  }

  /**
   * Clear all snapshots.
   */
  public static clearSnapshots(graphId?: string): void {
    if (graphId) {
      delete this.snapshots[graphId];
    } else {
      this.snapshots = {};
    }
  }

  /**
   * Perform a semantic diff between two graph states, finding added, removed, and updated nodes and edges.
   */
  public static diffGraphs(before: ProjectGraph, after: ProjectGraph): GraphDiff {
    const addedNodes: GraphNode[] = [];
    const removedNodes: string[] = [];
    const updatedNodes: { nodeId: string; before: GraphNode; after: GraphNode }[] = [];

    const addedEdges: GraphEdge[] = [];
    const removedEdges: string[] = [];

    // Diff nodes
    for (const [id, afterNode] of Object.entries(after.nodes)) {
      const beforeNode = before.nodes[id];
      if (!beforeNode) {
        addedNodes.push(JSON.parse(JSON.stringify(afterNode)));
      } else if (beforeNode.state.version !== afterNode.state.version || beforeNode.state.value !== afterNode.state.value) {
        updatedNodes.push({
          nodeId: id,
          before: JSON.parse(JSON.stringify(beforeNode)),
          after: JSON.parse(JSON.stringify(afterNode)),
        });
      }
    }

    for (const id of Object.keys(before.nodes)) {
      if (!after.nodes[id]) {
        removedNodes.push(id);
      }
    }

    // Diff edges
    for (const [id, afterEdge] of Object.entries(after.edges)) {
      const beforeEdge = before.edges[id];
      if (!beforeEdge) {
        addedEdges.push(JSON.parse(JSON.stringify(afterEdge)));
      }
    }

    for (const id of Object.keys(before.edges)) {
      if (!after.edges[id]) {
        removedEdges.push(id);
      }
    }

    return {
      addedNodes,
      removedNodes,
      updatedNodes,
      addedEdges,
      removedEdges,
    };
  }
}
