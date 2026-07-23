import { Node, Heartbeat, NodeStatus, ClusterEvent } from '../types';

export class NodeRegistry {
  private nodes: Map<string, Node> = new Map();
  private events: ClusterEvent[] = [];

  public registerNode(node: Node): void {
    this.nodes.set(node.id, node);
    this.logEvent('node_registered', 'info', `Node registered successfully: ${node.name} (${node.id})`, { nodeId: node.id });
  }

  public unregisterNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    this.nodes.delete(id);
    this.logEvent('node_removed', 'info', `Node removed: ${node.name} (${id})`, { nodeId: id });
    return true;
  }

  public drainNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    node.status = 'draining';
    this.logEvent('node_drained', 'warning', `Node entered draining state: ${node.name} (${id})`, { nodeId: id });
    return true;
  }

  public recordHeartbeat(hb: Heartbeat): boolean {
    const node = this.nodes.get(hb.nodeId);
    if (!node) return false;

    node.lastHeartbeat = hb.timestamp;
    node.telemetry = { ...node.telemetry, ...hb.telemetry };
    if (hb.currentShardId) node.currentShardId = hb.currentShardId;
    if (hb.status) node.status = hb.status;

    return true;
  }

  public getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  public listNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  public checkDeadNodes(timeoutMs: number = 30000): string[] {
    const now = Date.now();
    const deadNodeIds: string[] = [];

    this.nodes.forEach(node => {
      const elapsed = now - Date.now(); // Simulated timestamp diff or real
      const lastHbTime = new Date(node.lastHeartbeat).getTime();
      if (Date.now() - lastHbTime > timeoutMs && node.status !== 'offline') {
        node.status = 'offline';
        deadNodeIds.push(node.id);
        this.logEvent('heartbeat_lost', 'error', `Heartbeat timeout. Node offline: ${node.name} (${node.id})`, { nodeId: node.id });
      }
    });

    return deadNodeIds;
  }

  public getEvents(): ClusterEvent[] {
    return this.events;
  }

  public clearEvents(): void {
    this.events = [];
  }

  private logEvent(type: ClusterEvent['type'], severity: ClusterEvent['severity'], message: string, metadata?: any) {
    this.events.push({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      type,
      severity,
      message,
      metadata,
    });
  }
}
