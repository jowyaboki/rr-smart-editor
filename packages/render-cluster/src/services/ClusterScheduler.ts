import { Node, RenderShard, ShardAssignment } from '../types';
import { NodeRegistry } from './NodeRegistry';

export type LoadBalancingPolicy = 'least_loaded' | 'gpu_aware' | 'memory_aware' | 'cost_aware';

export class ClusterScheduler {
  private registry: NodeRegistry;
  private assignments: ShardAssignment[] = [];

  constructor(registry: NodeRegistry) {
    this.registry = registry;
  }

  /**
   * Dispatches a shard to the most eligible active node based on the policy
   */
  public scheduleShard(shard: RenderShard, policy: LoadBalancingPolicy = 'least_loaded'): ShardAssignment | null {
    const nodes = this.registry.listNodes().filter(n => n.status === 'idle');
    if (nodes.length === 0) return null;

    let targetNode: Node | null = null;

    if (policy === 'least_loaded') {
      // Find node with minimum CPU utilization
      targetNode = nodes.reduce((min, node) =>
        node.telemetry.cpuUsagePercent < min.telemetry.cpuUsagePercent ? node : min, nodes[0]);
    } else if (policy === 'gpu_aware') {
      // Prioritize GPU enabled nodes with lowest GPU utilization
      const gpuNodes = nodes.filter(n => n.capabilities.gpuEnabled);
      if (gpuNodes.length > 0) {
        targetNode = gpuNodes.reduce((min, node) =>
          (node.telemetry.gpuUsagePercent || 0) < (min.telemetry.gpuUsagePercent || 0) ? node : min, gpuNodes[0]);
      } else {
        // Fallback
        targetNode = nodes[0];
      }
    } else if (policy === 'memory_aware') {
      // Find node with largest available memory
      targetNode = nodes.reduce((max, node) =>
        node.capabilities.memoryGb > max.capabilities.memoryGb ? node : max, nodes[0]);
    } else if (policy === 'cost_aware') {
      // Find node with lowest cost
      targetNode = nodes.reduce((min, node) =>
        node.costPerHour < min.costPerHour ? node : min, nodes[0]);
    }

    if (!targetNode) return null;

    targetNode.status = 'busy';
    targetNode.currentShardId = shard.id;

    const assignment: ShardAssignment = {
      id: `assign_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      shardId: shard.id,
      nodeId: targetNode.id,
      assignedAt: new Date().toISOString(),
      status: 'active',
    };

    this.assignments.push(assignment);
    return assignment;
  }

  public getAssignmentForShard(shardId: string): ShardAssignment | undefined {
    return this.assignments.find(a => a.shardId === shardId && a.status === 'active');
  }

  public completeAssignment(shardId: string): void {
    const assign = this.getAssignmentForShard(shardId);
    if (assign) {
      assign.status = 'completed';
      const node = this.registry.getNode(assign.nodeId);
      if (node) {
        node.status = 'idle';
        node.currentShardId = undefined;
      }
    }
  }
}
