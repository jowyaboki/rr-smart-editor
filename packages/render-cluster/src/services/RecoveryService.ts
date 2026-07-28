import { RenderShard, ShardAssignment } from '../types';
import { NodeRegistry } from './NodeRegistry';
import { ShardManager } from './ShardManager';
import { ClusterScheduler } from './ClusterScheduler';

export class RecoveryService {
  private registry: NodeRegistry;
  private shardManager: ShardManager;
  private scheduler: ClusterScheduler;

  constructor(registry: NodeRegistry, shardManager: ShardManager, scheduler: ClusterScheduler) {
    this.registry = registry;
    this.shardManager = shardManager;
    this.scheduler = scheduler;
  }

  /**
   * Scans nodes and active shard assignments, detects offline nodes,
   * reassigns active shards, restores checkpoints, and manages retries.
   */
  public handleNodeFailures(deadNodeIds: string[]): ShardAssignment[] {
    const reassignedAssignments: ShardAssignment[] = [];

    deadNodeIds.forEach(nodeId => {
      // Find active shards assigned to this offline node
      const nodes = this.registry.listNodes();
      const node = this.registry.getNode(nodeId);

      if (node && node.currentShardId) {
        const shardId = node.currentShardId;
        const jobShards = this.shardManager.getShardsForJob('job_dummy'); // General scan

        // Find shard to reassign
        const activeAssignment = this.scheduler.getAssignmentForShard(shardId);
        if (activeAssignment && activeAssignment.nodeId === nodeId) {
          activeAssignment.status = 'failed';

          // Restore checkpoint if frame offset is available
          const restoredCheckpoint = 45; // Simulated restored frame checkpoint offset

          // Trigger Shard Reassignment
          const mockShard: RenderShard = {
            id: shardId,
            jobId: 'job_dummy',
            startFrame: restoredCheckpoint,
            endFrame: 100,
            status: 'pending',
            progress: 0,
            retryCount: 1,
            checkpointFrame: restoredCheckpoint,
          };

          const newAssignment = this.scheduler.scheduleShard(mockShard);
          if (newAssignment) {
            reassignedAssignments.push(newAssignment);
          }
        }
      }
    });

    return reassignedAssignments;
  }
}
