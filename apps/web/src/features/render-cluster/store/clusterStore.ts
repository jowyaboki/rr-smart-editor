import { create } from 'zustand';
import {
  Node,
  RenderShard,
  ClusterMetrics,
  ScalingPolicy,
  ClusterEvent,
  RenderClusterEngine,
} from '@ai-video-editor/render-cluster';

const localClusterEngine = new RenderClusterEngine();

const initialNodes: Node[] = [
  {
    id: 'as_web_node_1',
    name: 'Primary GPU Node (Local Host)',
    status: 'idle',
    capabilities: { gpuEnabled: true, gpuModel: 'NVIDIA RTX 4090', coresCount: 16, memoryGb: 64, supportedFormats: ['mp4', 'png'] },
    telemetry: { cpuUsagePercent: 14, gpuUsagePercent: 2, memoryUsageMb: 4096, storageUsageGb: 350, networkRxMb: 5, networkTxMb: 12 },
    costPerHour: 0.0,
    provider: 'local',
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: 'as_web_node_2',
    name: 'AWS g5.xlarge Spot Instance',
    status: 'idle',
    capabilities: { gpuEnabled: true, gpuModel: 'NVIDIA A10G', coresCount: 4, memoryGb: 16, supportedFormats: ['mp4', 'mov'] },
    telemetry: { cpuUsagePercent: 5, gpuUsagePercent: 0, memoryUsageMb: 1024, storageUsageGb: 80, networkRxMb: 2, networkTxMb: 1 },
    costPerHour: 0.45,
    provider: 'aws',
    lastHeartbeat: new Date().toISOString(),
  }
];

interface ClusterState {
  nodes: Node[];
  shards: RenderShard[];
  metrics: ClusterMetrics;
  scalingPolicies: ScalingPolicy[];
  events: ClusterEvent[];
  isLoading: boolean;

  // Actions
  initCluster: () => void;
  registerNode: (node: Node) => void;
  drainNode: (id: string) => void;
  removeNode: (id: string) => void;
  recordHeartbeat: (nodeId: string, cpu: number, gpu: number, mem: number) => void;
  splitJob: (jobId: string, framesCount: number, shardsCount: number) => void;
  evaluateScaling: (queueDepth: number) => void;
  clearEvents: () => void;
}

export const useClusterStore = create<ClusterState>((set, get) => {
  const defaultPolicy: ScalingPolicy = {
    id: 'pol_web_queue',
    metricType: 'queue_depth',
    upperThreshold: 8,
    lowerThreshold: 2,
    scaleUpIncrement: 2,
    scaleDownIncrement: 1,
    cooldownPeriodSec: 30,
  };

  return {
    nodes: [],
    shards: [],
    metrics: {
      totalNodes: 0,
      activeNodes: 0,
      idleNodes: 0,
      queueDepth: 0,
      renderThroughputFps: 0,
      averageCpuUsage: 0,
      totalMemoryMb: 0,
      totalStorageGb: 0,
      totalNetworkRxMb: 0,
      totalNetworkTxMb: 0,
      aggregatedCost: 0,
      currency: 'USD',
    },
    scalingPolicies: [defaultPolicy],
    events: [],
    isLoading: false,

    initCluster: () => {
      // Clear registry and register default nodes
      localClusterEngine.nodeRegistry.clearEvents();
      const nodes = localClusterEngine.nodeRegistry.listNodes();
      nodes.forEach(n => localClusterEngine.nodeRegistry.unregisterNode(n.id));

      initialNodes.forEach(n => localClusterEngine.nodeRegistry.registerNode(n));
      localClusterEngine.scalingService.registerPolicy(defaultPolicy);

      const metrics = localClusterEngine.coordinator.getClusterMetrics(0);

      set({
        nodes: localClusterEngine.nodeRegistry.listNodes(),
        metrics,
        events: localClusterEngine.nodeRegistry.getEvents(),
        shards: [],
      });
    },

    registerNode: (node) => {
      localClusterEngine.nodeRegistry.registerNode(node);
      const metrics = localClusterEngine.coordinator.getClusterMetrics(get().metrics.queueDepth);
      set({
        nodes: localClusterEngine.nodeRegistry.listNodes(),
        metrics,
        events: [...localClusterEngine.nodeRegistry.getEvents()],
      });
    },

    drainNode: (id) => {
      localClusterEngine.nodeRegistry.drainNode(id);
      set({
        nodes: localClusterEngine.nodeRegistry.listNodes(),
        events: [...localClusterEngine.nodeRegistry.getEvents()],
      });
    },

    removeNode: (id) => {
      localClusterEngine.nodeRegistry.unregisterNode(id);
      const metrics = localClusterEngine.coordinator.getClusterMetrics(get().metrics.queueDepth);
      set({
        nodes: localClusterEngine.nodeRegistry.listNodes(),
        metrics,
        events: [...localClusterEngine.nodeRegistry.getEvents()],
      });
    },

    recordHeartbeat: (nodeId, cpu, gpu, mem) => {
      const hb = {
        nodeId,
        timestamp: new Date().toISOString(),
        telemetry: {
          cpuUsagePercent: cpu,
          gpuUsagePercent: gpu,
          memoryUsageMb: mem,
          storageUsageGb: 50,
          networkRxMb: 5,
          networkTxMb: 10,
        },
      };
      localClusterEngine.nodeRegistry.recordHeartbeat(hb);
      const metrics = localClusterEngine.coordinator.getClusterMetrics(get().metrics.queueDepth);
      set({
        nodes: localClusterEngine.nodeRegistry.listNodes(),
        metrics,
      });
    },

    splitJob: (jobId, framesCount, shardsCount) => {
      const generated = localClusterEngine.shardManager.generateShards(jobId, 0, framesCount - 1, shardsCount);
      set({ shards: generated });
    },

    evaluateScaling: (queueDepth) => {
      const metrics = localClusterEngine.coordinator.getClusterMetrics(queueDepth);
      const decision = localClusterEngine.scalingService.evaluateScaling(metrics);

      if (decision.action === 'scale_up') {
        const events = [...get().events];
        events.push({
          id: `evt_scale_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'scale_up',
          severity: 'warning',
          message: `Queue size (${queueDepth}) exceeded limit. Scaled up worker pool by +${decision.increment} nodes.`,
        });

        // Register a mock scaled cloud node
        const num = get().nodes.length + 1;
        const cloudNode: Node = {
          id: `cloud_scale_node_${num}`,
          name: `AWS g5.xlarge Scale Node #${num}`,
          status: 'idle',
          capabilities: { gpuEnabled: true, gpuModel: 'NVIDIA A10G', coresCount: 4, memoryGb: 16, supportedFormats: ['mp4'] },
          telemetry: { cpuUsagePercent: 0, memoryUsageMb: 0, storageUsageGb: 80, networkRxMb: 0, networkTxMb: 0 },
          costPerHour: 0.45,
          provider: 'aws',
          lastHeartbeat: new Date().toISOString(),
        };
        localClusterEngine.nodeRegistry.registerNode(cloudNode);

        set({
          nodes: localClusterEngine.nodeRegistry.listNodes(),
          metrics: localClusterEngine.coordinator.getClusterMetrics(queueDepth),
          events,
        });
      } else if (decision.action === 'scale_down') {
        const events = [...get().events];
        events.push({
          id: `evt_scale_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'scale_down',
          severity: 'info',
          message: `Active load decreased. Scaled down worker pool by -${decision.increment} nodes.`,
        });

        const cloudNodes = get().nodes.filter(n => n.provider === 'aws');
        if (cloudNodes.length > 0) {
          localClusterEngine.nodeRegistry.unregisterNode(cloudNodes[cloudNodes.length - 1].id);
        }

        set({
          nodes: localClusterEngine.nodeRegistry.listNodes(),
          metrics: localClusterEngine.coordinator.getClusterMetrics(queueDepth),
          events,
        });
      } else {
        set({
          metrics: { ...metrics, queueDepth },
        });
      }
    },

    clearEvents: () => {
      set({ events: [] });
    },
  };
});
