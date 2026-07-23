import { NodeRegistry } from './services/NodeRegistry';
import { ClusterCoordinator } from './services/ClusterCoordinator';
import { ShardManager } from './services/ShardManager';
import { LeaseManager } from './services/LeaseManager';
import { ClusterScheduler } from './services/ClusterScheduler';
import { ScalingService } from './services/ScalingService';
import { RecoveryService } from './services/RecoveryService';
import {
  Cluster,
  Node,
  WorkerPool,
  WorkerLease,
  RenderShard,
  ShardAssignment,
  ClusterMetrics,
  ScalingPolicy,
  Heartbeat,
  ClusterEvent,
  CloudProviderAdapter,
} from './types';

export * from './types';
export * from './services/NodeRegistry';
export * from './services/ClusterCoordinator';
export * from './services/ShardManager';
export * from './services/LeaseManager';
export * from './services/ClusterScheduler';
export * from './services/ScalingService';
export * from './services/RecoveryService';

export class RenderClusterEngine {
  public nodeRegistry: NodeRegistry;
  public coordinator: ClusterCoordinator;
  public shardManager: ShardManager;
  public leaseManager: LeaseManager;
  public scheduler: ClusterScheduler;
  public scalingService: ScalingService;
  public recoveryService: RecoveryService;

  constructor() {
    this.nodeRegistry = new NodeRegistry();
    this.coordinator = new ClusterCoordinator(this.nodeRegistry);
    this.shardManager = new ShardManager();
    this.leaseManager = new LeaseManager();
    this.scheduler = new ClusterScheduler(this.nodeRegistry);
    this.scalingService = new ScalingService(this.nodeRegistry);
    this.recoveryService = new RecoveryService(this.nodeRegistry, this.shardManager, this.scheduler);
  }
}

export const globalRenderClusterEngine = new RenderClusterEngine();
