import { NodeGraph, Node, NodeConnection, NodeGroup, GraphSnapshot } from '../types';

export class NodeGraphService {
  private activeGraph: NodeGraph;
  private snapshots: GraphSnapshot[] = [];

  constructor(graphId: string, name: string) {
    this.activeGraph = {
      id: graphId,
      name,
      nodes: [],
      connections: [],
      groups: [],
      bookmarks: [],
      version: '1.0.0',
    };
  }

  public getGraph(): NodeGraph {
    return this.activeGraph;
  }

  public addNode(node: Node): void {
    this.activeGraph.nodes.push(node);
    this.activeGraph.version = `1.0.${Date.now()}`;
  }

  public removeNode(nodeId: string): void {
    // Remove the node itself
    this.activeGraph.nodes = this.activeGraph.nodes.filter((n) => n.id !== nodeId);

    // Remove any associated connections to prevent dead sockets
    this.activeGraph.connections = this.activeGraph.connections.filter(
      (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId,
    );

    // Clean up groups containing this node
    this.activeGraph.groups.forEach((g) => {
      g.nodeIds = g.nodeIds.filter((id) => id !== nodeId);
    });

    // Clean bookmarks
    this.activeGraph.bookmarks = this.activeGraph.bookmarks.filter((b) => b.nodeId !== nodeId);

    this.activeGraph.version = `1.0.${Date.now()}`;
  }

  public connect(fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string): void {
    // Prevent duplicate connection to the same input port
    this.activeGraph.connections = this.activeGraph.connections.filter(
      (c) => !(c.toNodeId === toNodeId && c.toPortId === toPortId),
    );

    const connection: NodeConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      fromNodeId,
      fromPortId,
      toNodeId,
      toPortId,
    };

    this.activeGraph.connections.push(connection);

    // Mark target node as dirty
    const targetNode = this.activeGraph.nodes.find((n) => n.id === toNodeId);
    if (targetNode) {
      targetNode.isDirty = true;
    }

    this.activeGraph.version = `1.0.${Date.now()}`;
  }

  public disconnect(connectionId: string): void {
    const conn = this.activeGraph.connections.find((c) => c.id === connectionId);
    if (conn) {
      const targetNode = this.activeGraph.nodes.find((n) => n.id === conn.toNodeId);
      if (targetNode) targetNode.isDirty = true;
    }
    this.activeGraph.connections = this.activeGraph.connections.filter(
      (c) => c.id !== connectionId,
    );
    this.activeGraph.version = `1.0.${Date.now()}`;
  }

  public createGroup(name: string, nodeIds: string[], color?: string): NodeGroup {
    const group: NodeGroup = {
      id: `group_${Date.now()}`,
      name,
      nodeIds,
      color: color || '#2563eb',
      bounds: { x: 50, y: 50, width: 300, height: 200 },
    };
    this.activeGraph.groups.push(group);
    return group;
  }

  public addBookmark(nodeId: string, label: string): void {
    this.activeGraph.bookmarks.push({
      id: `bookmark_${Date.now()}`,
      nodeId,
      label,
    });
  }

  public takeSnapshot(description: string): GraphSnapshot {
    const snapshot: GraphSnapshot = {
      id: `snap_${Date.now()}`,
      graph: JSON.parse(JSON.stringify(this.activeGraph)),
      timestamp: new Date().toISOString(),
      description,
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  public restoreSnapshot(snapshotId: string): void {
    const found = this.snapshots.find((s) => s.id === snapshotId);
    if (found) {
      this.activeGraph = JSON.parse(JSON.stringify(found.graph));
    }
  }

  public propagateDirtyState(nodeId: string): void {
    const visited = new Set<string>();

    const dfs = (currId: string) => {
      if (visited.has(currId)) return;
      visited.add(currId);

      const node = this.activeGraph.nodes.find((n) => n.id === currId);
      if (node) {
        node.isDirty = true;
      }

      // Find children connected to outputs of current node
      const forwardConnections = this.activeGraph.connections.filter(
        (c) => c.fromNodeId === currId,
      );
      forwardConnections.forEach((c) => {
        dfs(c.toNodeId);
      });
    };

    dfs(nodeId);
  }
}
