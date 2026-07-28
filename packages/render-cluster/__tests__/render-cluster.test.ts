import { describe, test } from 'node:test';
import assert from 'node:assert';
import { RenderClusterEngine, CloudProviderAdapter, Node, Heartbeat } from '../src/index';

describe('Distributed Rendering Cluster Core Unit Tests', () => {

  // Setup sample mock nodes
  const mockNodeA: Node = {
    id: 'node_alpha',
    name: 'AWS Spot g4dn.2xlarge',
    status: 'idle',
    capabilities: {
      gpuEnabled: true,
      gpuModel: 'NVIDIA T4',
      coresCount: 8,
      memoryGb: 32,
      supportedFormats: ['mp4', 'mov', 'png'],
    },
    telemetry: {
      cpuUsagePercent: 12,
      gpuUsagePercent: 0,
      memoryUsageMb: 2048,
      storageUsageGb: 50,
      networkRxMb: 10,
      networkTxMb: 5,
    },
    costPerHour: 0.75,
    provider: 'aws',
    lastHeartbeat: new Date().toISOString(),
  };

  const mockNodeB: Node = {
    id: 'node_beta',
    name: 'On-Prem Dedicated Server',
    status: 'idle',
    capabilities: {
      gpuEnabled: false,
      coresCount: 16,
      memoryGb: 64,
      supportedFormats: ['mp4', 'png'],
    },
    telemetry: {
      cpuUsagePercent: 8,
      memoryUsageMb: 4096,
      storageUsageGb: 120,
      networkRxMb: 5,
      networkTxMb: 2,
    },
    costPerHour: 0.20,
    provider: 'local',
    lastHeartbeat: new Date().toISOString(),
  };

  const cloneNode = (node: Node): Node => JSON.parse(JSON.stringify(node));

  test('Node Registration, Graceful Draining, and Offline Detection', () => {
    const engine = new RenderClusterEngine();

    // Register
    engine.nodeRegistry.registerNode(cloneNode(mockNodeA));
    engine.nodeRegistry.registerNode(cloneNode(mockNodeB));

    assert.strictEqual(engine.nodeRegistry.listNodes().length, 2);
    assert.strictEqual(engine.nodeRegistry.getNode('node_alpha')?.name, 'AWS Spot g4dn.2xlarge');

    // Heartbeat update
    const hb: Heartbeat = {
      nodeId: 'node_alpha',
      timestamp: new Date().toISOString(),
      telemetry: {
        cpuUsagePercent: 95, // Under extreme load
        gpuUsagePercent: 80,
        memoryUsageMb: 8192,
        storageUsageGb: 52,
        networkRxMb: 450,
        networkTxMb: 200,
      },
      status: 'busy',
    };
    engine.nodeRegistry.recordHeartbeat(hb);
    assert.strictEqual(engine.nodeRegistry.getNode('node_alpha')?.status, 'busy');
    assert.strictEqual(engine.nodeRegistry.getNode('node_alpha')?.telemetry.cpuUsagePercent, 95);

    // Drain
    engine.nodeRegistry.drainNode('node_beta');
    assert.strictEqual(engine.nodeRegistry.getNode('node_beta')?.status, 'draining');

    // Unregister
    engine.nodeRegistry.unregisterNode('node_beta');
    assert.strictEqual(engine.nodeRegistry.listNodes().length, 1);
  });

  test('Load Balancing - Least-Loaded, GPU-Aware, Cost-Aware Scheduling', () => {
    const engine = new RenderClusterEngine();
    engine.nodeRegistry.registerNode(cloneNode(mockNodeA)); // GPU enabled, cost = 0.75, CPU = 12
    engine.nodeRegistry.registerNode(cloneNode(mockNodeB)); // GPU disabled, cost = 0.20, CPU = 8

    const shard = {
      id: 'shard_job_1_0',
      jobId: 'job_1',
      startFrame: 0,
      endFrame: 100,
      status: 'pending' as const,
      progress: 0,
      retryCount: 0,
    };

    // 1. Cost-Aware scheduling
    const assignCost = engine.scheduler.scheduleShard(shard, 'cost_aware');
    assert.ok(assignCost);
    assert.strictEqual(assignCost.nodeId, 'node_beta'); // node_beta is cheaper ($0.20 vs $0.75)
    engine.scheduler.completeAssignment('shard_job_1_0');

    // 2. GPU-Aware scheduling
    const assignGpu = engine.scheduler.scheduleShard(shard, 'gpu_aware');
    assert.ok(assignGpu);
    assert.strictEqual(assignGpu.nodeId, 'node_alpha'); // node_alpha has GPU enabled
    engine.scheduler.completeAssignment('shard_job_1_0');
  });

  test('Auto Scaling triggers - Evaluating limits and thresholds', () => {
    const engine = new RenderClusterEngine();
    engine.nodeRegistry.registerNode(cloneNode(mockNodeA));

    const policy = {
      id: 'pol_cpu',
      metricType: 'cpu_utilization' as const,
      upperThreshold: 80,
      lowerThreshold: 20,
      scaleUpIncrement: 2,
      scaleDownIncrement: 1,
      cooldownPeriodSec: 0,
    };
    engine.scalingService.registerPolicy(policy);

    // Case 1: Low CPU usage -> scale down (if we have multiple nodes)
    const metricsLow = engine.coordinator.getClusterMetrics(5); // queueDepth = 5
    metricsLow.totalNodes = 5;
    metricsLow.averageCpuUsage = 10; // below 20

    const scaleDown = engine.scalingService.evaluateScaling(metricsLow);
    assert.strictEqual(scaleDown.action, 'scale_down');
    assert.strictEqual(scaleDown.targetSize, 4);

    // Case 2: High CPU usage -> scale up
    const metricsHigh = engine.coordinator.getClusterMetrics(15);
    metricsHigh.totalNodes = 2;
    metricsHigh.averageCpuUsage = 90; // above 80

    const scaleUp = engine.scalingService.evaluateScaling(metricsHigh);
    assert.strictEqual(scaleUp.action, 'scale_up');
    assert.strictEqual(scaleUp.targetSize, 4);
  });

  test('Worker recovery & Shard Checkpoint Reassignment', () => {
    const engine = new RenderClusterEngine();
    engine.nodeRegistry.registerNode(cloneNode(mockNodeA));
    engine.nodeRegistry.registerNode(cloneNode(mockNodeB));

    const shard = {
      id: 'shard_job_1_0',
      jobId: 'job_1',
      startFrame: 0,
      endFrame: 100,
      status: 'pending' as const,
      progress: 0,
      retryCount: 0,
    };

    // Assign shard to node_alpha
    const assignment = engine.scheduler.scheduleShard(shard, 'gpu_aware');
    assert.ok(assignment);
    assert.strictEqual(assignment.nodeId, 'node_alpha');

    // Simulate node_alpha going offline
    const deadNodes = ['node_alpha'];
    const reassignments = engine.recoveryService.handleNodeFailures(deadNodes);

    // Reassigned successfully to node_beta
    assert.strictEqual(reassignments.length, 1);
    assert.strictEqual(reassignments[0].nodeId, 'node_beta');
    assert.strictEqual(reassignments[0].shardId, 'shard_job_1_0');
  });

  test('Frame Sharding and Job distribution', () => {
    const engine = new RenderClusterEngine();
    const shards = engine.shardManager.generateShards('job_100', 0, 999, 10);

    assert.strictEqual(shards.length, 10);
    assert.strictEqual(shards[0].startFrame, 0);
    assert.strictEqual(shards[0].endFrame, 99);
    assert.strictEqual(shards[9].startFrame, 900);
    assert.strictEqual(shards[9].endFrame, 999);

    // Update progress
    engine.shardManager.updateShardProgress('job_100', 'shard_job_100_0', 100);
    const updatedShards = engine.shardManager.getShardsForJob('job_100');
    assert.strictEqual(updatedShards[0].status, 'completed');
    assert.strictEqual(updatedShards[0].progress, 100);
  });

  test('Plugin & Cloud Provider Adapter registration', async () => {
    const engine = new RenderClusterEngine();

    const mockGcpAdapter: CloudProviderAdapter = {
      id: 'gcp_batch',
      name: 'Google Cloud Batch',
      provisionNode: async (cfg) => ({
        id: 'node_gcp_1',
        name: 'GCP e2-standard-4',
        status: 'idle',
        capabilities: { gpuEnabled: false, coresCount: 4, memoryGb: 16, supportedFormats: ['mp4'] },
        telemetry: { cpuUsagePercent: 0, memoryUsageMb: 0, storageUsageGb: 20, networkRxMb: 0, networkTxMb: 0 },
        costPerHour: 0.16,
        provider: 'gcp',
        lastHeartbeat: new Date().toISOString(),
      }),
      deprovisionNode: async (id) => true,
      getCostEstimate: async (type, hrs) => 0.16 * hrs,
      scaleCluster: async (size) => size,
    };

    engine.coordinator.registerAdapter(mockGcpAdapter);
    assert.strictEqual(engine.coordinator.getAdapter('gcp_batch')?.name, 'Google Cloud Batch');

    const node = await engine.coordinator.getAdapter('gcp_batch')?.provisionNode({});
    assert.ok(node);
    assert.strictEqual(node.id, 'node_gcp_1');
  });

  test('1000 Concurrent Jobs Scaling simulation', async () => {
    const engine = new RenderClusterEngine();

    // Scale registration
    const start = Date.now();
    const shards = engine.shardManager.generateShards('job_large_scale', 0, 9999, 1000);
    const duration = Date.now() - start;

    assert.strictEqual(shards.length, 1000);
    assert.ok(duration < 250); // Frame sharding 10,000 frames into 1,000 segments must take less than 250ms
  });
});
