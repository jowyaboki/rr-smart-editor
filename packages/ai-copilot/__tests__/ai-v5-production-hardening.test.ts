import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  AIExecutionRuntime,
  ProductionPipelineBuilder,
  ProductionBrief,
  ExecutionGraph,
  ExecutionContextSnapshot,
  MemoryCheckpointStore,
  QualityGateValidator,
  EnterpriseOrchestrator
} from '../src';

describe('AI Execution Platform v5.0 Production Hardening & E2E Validation', () => {

  test('Real End-to-End Production Pipeline (Brief -> Script -> Storyboard -> Assets -> Timeline -> Approval -> Quality Gate -> Render Package)', async () => {
    const runtime = new AIExecutionRuntime();
    const brief: ProductionBrief = {
      briefId: 'brief_cyberpunk_2026',
      title: 'Cyberpunk 2026 Game Trailer',
      prompt: 'Cinematic 30s trailer for a cyberpunk action game',
      targetPlatform: 'youtube',
      targetDurationSec: 30,
      qualityThreshold: 85
    };

    const graph = ProductionPipelineBuilder.createProductionGraph(brief);
    const initialContext = ProductionPipelineBuilder.createInitialContext(brief);

    // 1. Initial run stops at director approval gate
    const intermediateContext = await runtime.runWorkflow(graph, initialContext);
    assert.equal(intermediateContext.status, 'waiting_for_approval');
    assert.equal(graph.nodes.director_approval_gate.status, 'waiting_for_approval');
    assert.ok(intermediateContext.variables.scriptText !== undefined);
    assert.ok(intermediateContext.variables.scenes !== undefined);
    assert.ok(intermediateContext.variables.resolvedAssets !== undefined);
    assert.ok(intermediateContext.variables.projectTimeline !== undefined);

    // 2. Authoritative Human Sign-off
    const finalContext = await runtime.resolveApprovalGate(
      intermediateContext,
      graph,
      'director_approval_gate',
      true,
      'Sarah (Creative Director)',
      'Approved for final render packaging'
    );

    assert.equal(finalContext.status, 'completed');
    assert.equal(graph.nodes.final_packaging.status, 'completed');
    assert.ok(finalContext.variables.packageUri !== undefined);
    assert.equal(finalContext.artifacts.length, 5); // script, storyboard, assets, timeline, final package
  });

  test('Failure Injection & Recovery (Injected Error, Retry Policy, Checkpoint Rollback)', async () => {
    const runtime = new AIExecutionRuntime();
    let networkFailures = 0;

    const graph: ExecutionGraph = {
      graphId: 'graph_failure_inj',
      name: 'Failure Injection Test Graph',
      version: '5.0',
      nodes: {
        stable_node: {
          id: 'stable_node',
          name: 'Stable Node',
          agentRole: 'custom',
          status: 'pending',
          dependencies: [],
          handler: async () => ({ stableData: 'ok' })
        },
        injected_node: {
          id: 'injected_node',
          name: 'Injected Network Failure Node',
          agentRole: 'custom',
          status: 'pending',
          dependencies: ['stable_node'],
          retryPolicy: { maxRetries: 3, backoffMs: 5, exponential: false },
          handler: async () => {
            networkFailures++;
            if (networkFailures < 3) {
              throw new Error('503 Service Unavailable: Simulated Network Timeout');
            }
            return { recoveredData: 'recovered' };
          }
        }
      }
    };

    const context: ExecutionContextSnapshot = {
      executionId: 'exec_fail_inj_1',
      workflowId: 'wf_fail_inj',
      projectId: 'proj_fail_inj',
      status: 'pending',
      currentStage: 'start',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    const finalCtx = await runtime.runWorkflow(graph, context);
    assert.equal(finalCtx.status, 'completed');
    assert.equal(networkFailures, 3);
    assert.equal(finalCtx.metrics.retryCounts['injected_node'], 2);

    // Rollback to first checkpoint
    const firstCheckpointId = finalCtx.checkpoints[0].checkpointId;
    const restoredCtx = await runtime.restoreCheckpoint(finalCtx, graph, firstCheckpointId);
    assert.equal(restoredCtx.currentStage, 'stable_node');
  });

  test('Long-Running Production Execution (50 Nodes, Concurrency Scaling)', async () => {
    const runtime = new AIExecutionRuntime({ concurrencyLimit: 25 });
    const nodeCount = 50;
    const nodes: ExecutionGraph['nodes'] = {};

    for (let i = 0; i < nodeCount; i++) {
      nodes[`node_${i}`] = {
        id: `node_${i}`,
        name: `Scale Node ${i}`,
        agentRole: 'custom',
        status: 'pending',
        dependencies: i === 0 ? [] : [`node_${Math.floor(i / 2)}`], // Tree DAG structure
        handler: async () => ({ [`out_${i}`]: i })
      };
    }

    const graph: ExecutionGraph = {
      graphId: 'graph_scale_50',
      name: '50 Node Tree Graph',
      version: '5.0',
      nodes
    };

    const initialContext: ExecutionContextSnapshot = {
      executionId: 'exec_scale_50',
      workflowId: 'wf_scale',
      projectId: 'proj_scale',
      status: 'pending',
      currentStage: 'start',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    const startTime = performance.now();
    const finalCtx = await runtime.runWorkflow(graph, initialContext);
    const durationMs = performance.now() - startTime;

    assert.equal(finalCtx.status, 'completed');
    assert.equal(Object.keys(finalCtx.metrics.nodeDurationsMs).length, nodeCount);
    assert.ok(durationMs < 3000, `50-node tree execution completed in ${durationMs}ms`);
  });

  test('Multi-Project Concurrency & Strict State Isolation', async () => {
    const runtime = new AIExecutionRuntime({ concurrencyLimit: 20 });

    const createProjGraph = (projId: string): ExecutionGraph => ({
      graphId: `graph_${projId}`,
      name: `Graph for ${projId}`,
      version: '5.0',
      nodes: {
        step1: {
          id: 'step1',
          name: 'Task 1',
          agentRole: 'custom',
          status: 'pending',
          dependencies: [],
          handler: async () => ({ secretKey: `secret_for_${projId}` })
        }
      }
    });

    const createProjContext = (projId: string): ExecutionContextSnapshot => ({
      executionId: `exec_${projId}`,
      workflowId: `wf_${projId}`,
      projectId: projId,
      status: 'pending',
      currentStage: 'start',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    });

    const [ctxA, ctxB] = await Promise.all([
      runtime.runWorkflow(createProjGraph('project_alpha'), createProjContext('project_alpha')),
      runtime.runWorkflow(createProjGraph('project_beta'), createProjContext('project_beta'))
    ]);

    assert.equal(ctxA.variables.secretKey, 'secret_for_project_alpha');
    assert.equal(ctxB.variables.secretKey, 'secret_for_project_beta');
    assert.notEqual(ctxA.executionId, ctxB.executionId);
  });

  test('Persistence Restart & Application Recovery', async () => {
    const checkpointStore = new MemoryCheckpointStore();
    const runtime1 = new AIExecutionRuntime({ checkpointStore });

    const brief: ProductionBrief = {
      briefId: 'brief_restart_test',
      title: 'Restart Test Video',
      prompt: 'Test restart recovery',
      targetPlatform: 'tiktok',
      targetDurationSec: 15,
      qualityThreshold: 80
    };

    const graph = ProductionPipelineBuilder.createProductionGraph(brief);
    const initialContext = ProductionPipelineBuilder.createInitialContext(brief);

    // Initial run up to approval gate
    const intermediateCtx = await runtime1.runWorkflow(graph, initialContext);
    const lastCheckpoint = await checkpointStore.getLatestCheckpoint(intermediateCtx.executionId);
    assert.ok(lastCheckpoint !== null);

    // Simulate application restart with new runtime instance referencing same store
    const runtime2 = new AIExecutionRuntime({ checkpointStore });

    const recoveredCtx = await runtime2.restoreCheckpoint(intermediateCtx, graph, lastCheckpoint!.checkpointId);
    assert.equal(recoveredCtx.executionId, intermediateCtx.executionId);

    // Resume execution
    const finalCtx = await runtime2.resolveApprovalGate(recoveredCtx, graph, 'director_approval_gate', true, 'QA Auditor');
    assert.equal(finalCtx.status, 'completed');
  });

});
