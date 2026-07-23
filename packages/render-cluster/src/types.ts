// Core Models for Distributed Rendering Cluster
export type NodeStatus = 'idle' | 'busy' | 'draining' | 'offline';

export interface Node {
  id: string;
  name: string;
  status: NodeStatus;
  capabilities: {
    gpuEnabled: boolean;
    gpuModel?: string;
    coresCount: number;
    memoryGb: number;
    supportedFormats: string[];
  };
  telemetry: {
    cpuUsagePercent: number;
    gpuUsagePercent?: number;
    memoryUsageMb: number;
    storageUsageGb: number;
    networkRxMb: number;
    networkTxMb: number;
    temperatureCelsius?: number;
  };
  costPerHour: number;
  provider: 'local' | 'docker' | 'kubernetes' | 'aws' | 'gcp' | 'azure' | 'nomad' | string;
  lastHeartbeat: string;
  currentShardId?: string;
}

export interface Cluster {
  id: string;
  name: string;
  nodes: Node[];
  status: 'active' | 'inactive' | 'degraded';
  createdAt: string;
}

export interface WorkerPool {
  id: string;
  name: string;
  nodeIds: string[];
  minSize: number;
  maxSize: number;
  targetSize: number;
}

export interface WorkerLease {
  id: string;
  nodeId: string;
  jobId: string;
  shardId: string;
  leasedAt: string;
  expiresAt: string;
  releasedAt?: string;
}

export type ShardStatus = 'pending' | 'rendering' | 'completed' | 'failed';

export interface RenderShard {
  id: string;
  jobId: string;
  startFrame: number;
  endFrame: number;
  status: ShardStatus;
  progress: number; // 0 to 100
  retryCount: number;
  checkpointFrame?: number; // Latest successfully rendered frame checkpoint
  outputUrl?: string;
  error?: string;
}

export interface ShardAssignment {
  id: string;
  shardId: string;
  nodeId: string;
  assignedAt: string;
  status: 'active' | 'completed' | 'failed';
}

export interface ClusterMetrics {
  totalNodes: number;
  activeNodes: number;
  idleNodes: number;
  queueDepth: number;
  renderThroughputFps: number;
  averageCpuUsage: number;
  averageGpuUsage?: number;
  totalMemoryMb: number;
  totalStorageGb: number;
  totalNetworkRxMb: number;
  totalNetworkTxMb: number;
  aggregatedCost: number; // Projected hourly/job spend
  currency: string;
}

export interface ScalingPolicy {
  id: string;
  metricType: 'queue_depth' | 'cpu_utilization' | 'gpu_utilization' | 'schedule';
  upperThreshold: number; // Trigger scale up if exceeded
  lowerThreshold: number; // Trigger scale down if below
  scaleUpIncrement: number;
  scaleDownIncrement: number;
  cooldownPeriodSec: number;
  lastScalingActionAt?: string;
}

export interface Heartbeat {
  nodeId: string;
  timestamp: string;
  telemetry: Node['telemetry'];
  currentShardId?: string;
  status?: NodeStatus;
}

export interface ClusterEvent {
  id: string;
  timestamp: string;
  type: 'node_registered' | 'node_removed' | 'node_drained' | 'shard_assigned' | 'shard_reassigned' | 'shard_failed' | 'scale_up' | 'scale_down' | 'heartbeat_lost' | 'checkpoint_restored';
  severity: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

// Cloud Provider Abstractions
export interface CloudProviderAdapter {
  id: string;
  name: string;
  provisionNode: (nodeConfig: any) => Promise<Node>;
  deprovisionNode: (nodeId: string) => Promise<boolean>;
  getCostEstimate: (nodeType: string, durationHours: number) => Promise<number>;
  scaleCluster: (targetSize: number) => Promise<number>;
}
