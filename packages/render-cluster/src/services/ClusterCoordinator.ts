import { ClusterMetrics, Node, CloudProviderAdapter, ClusterEvent } from '../types';
import { NodeRegistry } from './NodeRegistry';

export class ClusterCoordinator {
  private registry: NodeRegistry;
  private adapters: Map<string, CloudProviderAdapter> = new Map();

  constructor(registry: NodeRegistry) {
    this.registry = registry;
  }

  public registerAdapter(adapter: CloudProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public getAdapter(id: string): CloudProviderAdapter | undefined {
    return this.adapters.get(id);
  }

  /**
   * Aggregates telemetry from all nodes to compute Cluster telemetry stats
   */
  public getClusterMetrics(queueDepth: number = 0): ClusterMetrics {
    const nodes = this.registry.listNodes();
    const totalNodes = nodes.length;
    const activeNodes = nodes.filter(n => n.status === 'busy').length;
    const idleNodes = nodes.filter(n => n.status === 'idle').length;

    let totalCpu = 0;
    let totalGpu = 0;
    let gpuNodesCount = 0;
    let totalMemory = 0;
    let totalStorage = 0;
    let totalRx = 0;
    let totalTx = 0;
    let totalCost = 0;

    nodes.forEach(node => {
      totalCpu += node.telemetry.cpuUsagePercent;
      if (node.capabilities.gpuEnabled) {
        totalGpu += node.telemetry.gpuUsagePercent || 0;
        gpuNodesCount++;
      }
      totalMemory += node.telemetry.memoryUsageMb;
      totalStorage += node.telemetry.storageUsageGb;
      totalRx += node.telemetry.networkRxMb;
      totalTx += node.telemetry.networkTxMb;
      totalCost += node.costPerHour;
    });

    const averageCpuUsage = totalNodes > 0 ? totalCpu / totalNodes : 0;
    const averageGpuUsage = gpuNodesCount > 0 ? totalGpu / gpuNodesCount : undefined;

    return {
      totalNodes,
      activeNodes,
      idleNodes,
      queueDepth,
      renderThroughputFps: activeNodes * 24, // Simulated frames per second
      averageCpuUsage,
      averageGpuUsage,
      totalMemoryMb: totalMemory,
      totalStorageGb: totalStorage,
      totalNetworkRxMb: totalRx,
      totalNetworkTxMb: totalTx,
      aggregatedCost: totalCost,
      currency: 'USD',
    };
  }
}
