import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  AIExecutionRuntime,
  ExecutionGraph,
  ExecutionContextSnapshot,
  DependencyResolver,
  JobScheduler,
  MemoryCheckpointStore,
  QualityGateValidator,
  EnterpriseOrchestrator
} from '../src';

describe('Autonomous Creative Execution Runtime (v4.0)', () => {

  test('DependencyResolver topological sort & validation', () => {
    const validGraph: ExecutionGraph = {
      graphId: 'test_graph_1',
      name: 'Valid DAG',
      version: '1.0',
      nodes: {
        node_a: { id: 'node_a', name: 'Node A', agentRole: 'script_writer', status: 'pending', dependencies: [] },
        node_b: { id: 'node_b', name: 'Node B', agentRole: 'storyboard_planner', status: 'pending', dependencies: ['node_a'] },
        node_c: { id: 'node_c', name: 'Node C', agentRole: 'timeline_builder', status: 'pending', dependencies: ['node_b'] }
      }
    };

    const validation = DependencyResolver.validateGraph(validGraph);
    assert.equal(validation.valid, true);

    const order = DependencyResolver.topologicalSort(validGraph);
    assert.deepEqual(order, ['node_a', 'node_b', 'node_c']);

    const cyclicGraph: ExecutionGraph = {
      graphId: 'test_graph_cycle',
      name: 'Cyclic DAG',
      version: '1.0',
      nodes: {
        node_a: { id: 'node_a', name: 'Node A', agentRole: 'script_writer', status: 'pending', dependencies: ['node_b'] },
        node_b: { id: 'node_b', name: 'Node B', agentRole: 'storyboard_planner', status: 'pending', dependencies: ['node_a'] }
      }
    };

    const cycleValidation = DependencyResolver.validateGraph(cyclicGraph);
    assert.equal(cycleValidation.valid, false);
    assert.match(cycleValidation.errors[0], /Cyclic dependency/);
  });

  test('JobScheduler scheduling & dispatch latency', async () => {
    const scheduler = new JobScheduler(5);
    const start = performance.now();

    const node = { id: 'node_1', name: 'Task 1', agentRole: 'custom' as const, status: 'pending' as const, dependencies: [] };
    const context: ExecutionContextSnapshot = {
      executionId: 'exec_sched_1',
      workflowId: 'wf_1',
      projectId: 'proj_1',
      status: 'running',
      currentStage: 'init',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    const signal = new AbortController().signal;
    node.handler = async () => ({ value: 42 });

    const result = await scheduler.scheduleNode(node, context, signal);
    const elapsed = performance.now() - start;

    assert.equal(result.value, 42);
    assert.ok(context.metrics.schedulerLatencyMs !== undefined);
    assert.ok(elapsed < 200);
  });

  test('Complete Graph Execution & Concurrent Parallel Tasks (10, 50, 100 tasks)', async () => {
    const runtime = new AIExecutionRuntime({ concurrencyLimit: 20 });

    const taskCounts = [10, 50, 100];
    for (const count of taskCounts) {
      const nodes: ExecutionGraph['nodes'] = {};
      for (let i = 0; i < count; i++) {
        nodes[`task_${i}`] = {
          id: `task_${i}`,
          name: `Parallel Task ${i}`,
          agentRole: 'custom',
          status: 'pending',
          dependencies: [],
          handler: async () => ({ [`res_${i}`]: i })
        };
      }

      const graph: ExecutionGraph = {
        graphId: `perf_graph_${count}`,
        name: `Parallel ${count} Graph`,
        version: '1.0',
        nodes
      };

      const initialContext: ExecutionContextSnapshot = {
        executionId: `exec_perf_${count}`,
        workflowId: 'wf_perf',
        projectId: 'proj_perf',
        status: 'pending',
        currentStage: 'start',
        variables: {},
        artifacts: [],
        checkpoints: [],
        approvals: [],
        errors: [],
        metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
      };

      const start = performance.now();
      const finalCtx = await runtime.runWorkflow(graph, initialContext);
      const duration = performance.now() - start;

      assert.equal(finalCtx.status, 'completed');
      assert.equal(Object.keys(finalCtx.metrics.nodeDurationsMs).length, count);
      assert.ok(duration < 5000, `Execution for ${count} tasks took ${duration}ms`);
    }
  });

  test('Human Approval Gate & Resolution', async () => {
    const runtime = new AIExecutionRuntime();

    const graph: ExecutionGraph = {
      graphId: 'graph_approval',
      name: 'Approval Workflow',
      version: '1.0',
      nodes: {
        step1: {
          id: 'step1',
          name: 'Script Creation',
          agentRole: 'script_writer',
          status: 'pending',
          dependencies: [],
          handler: async () => ({ script: 'Once upon a time...' })
        },
        step2: {
          id: 'step2',
          name: 'Director Sign-off',
          agentRole: 'creative_director',
          status: 'pending',
          dependencies: ['step1'],
          approvalGate: {
            id: 'app_1',
            nodeId: 'step2',
            title: 'Approve Script',
            description: 'Verify narrative quality',
            requestedAt: new Date().toISOString(),
            status: 'pending'
          },
          handler: async () => ({ approvedScript: true })
        }
      }
    };

    const initialContext: ExecutionContextSnapshot = {
      executionId: 'exec_app_1',
      workflowId: 'wf_app',
      projectId: 'proj_app',
      status: 'pending',
      currentStage: 'start',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    // Run workflow - should pause at step2 approval gate
    const intermediateCtx = await runtime.runWorkflow(graph, initialContext);
    assert.equal(intermediateCtx.status, 'waiting_for_approval');
    assert.equal(graph.nodes.step2.status, 'waiting_for_approval');

    // Resolve approval
    const finalCtx = await runtime.resolveApprovalGate(intermediateCtx, graph, 'step2', true, 'Sarah (Creative Director)', 'Looks great!');
    assert.equal(finalCtx.status, 'completed');
    assert.equal(graph.nodes.step2.status, 'completed');
  });

  test('Checkpointing & Rollback Restoration', async () => {
    const memoryStore = new MemoryCheckpointStore();
    const runtime = new AIExecutionRuntime({ checkpointStore: memoryStore });

    const graph: ExecutionGraph = {
      graphId: 'graph_chk',
      name: 'Checkpoint Workflow',
      version: '1.0',
      nodes: {
        stage1: {
          id: 'stage1',
          name: 'Stage 1',
          agentRole: 'custom',
          status: 'pending',
          dependencies: [],
          handler: async () => ({ key1: 'val1' })
        },
        stage2: {
          id: 'stage2',
          name: 'Stage 2',
          agentRole: 'custom',
          status: 'pending',
          dependencies: ['stage1'],
          handler: async () => ({ key2: 'val2' })
        }
      }
    };

    const initialContext: ExecutionContextSnapshot = {
      executionId: 'exec_chk_1',
      workflowId: 'wf_chk',
      projectId: 'proj_chk',
      status: 'pending',
      currentStage: 'start',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    const finalCtx = await runtime.runWorkflow(graph, initialContext);
    assert.equal(finalCtx.checkpoints.length, 2);

    const firstCheckpointId = finalCtx.checkpoints[0].checkpointId;
    const restoredCtx = await runtime.restoreCheckpoint(finalCtx, graph, firstCheckpointId);

    assert.equal(restoredCtx.currentStage, 'stage1');
    assert.equal(restoredCtx.status, 'running');
  });

  test('Retry Policy & Failure Recovery', async () => {
    const runtime = new AIExecutionRuntime();
    let attempts = 0;

    const graph: ExecutionGraph = {
      graphId: 'graph_retry',
      name: 'Retry Workflow',
      version: '1.0',
      nodes: {
        flaky_node: {
          id: 'flaky_node',
          name: 'Flaky Network Node',
          agentRole: 'custom',
          status: 'pending',
          dependencies: [],
          retryPolicy: { maxRetries: 3, backoffMs: 10, exponential: false },
          handler: async () => {
            attempts++;
            if (attempts < 3) {
              throw new Error('Temporary connection error');
            }
            return { recovered: true };
          }
        }
      }
    };

    const initialContext: ExecutionContextSnapshot = {
      executionId: 'exec_retry_1',
      workflowId: 'wf_retry',
      projectId: 'proj_retry',
      status: 'pending',
      currentStage: 'start',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    const finalCtx = await runtime.runWorkflow(graph, initialContext);
    assert.equal(finalCtx.status, 'completed');
    assert.equal(attempts, 3);
    assert.equal(finalCtx.metrics.retryCounts['flaky_node'], 2);
  });

  test('Quality Gate Rules & Enterprise Quota Enforcement', async () => {
    const runtime = new AIExecutionRuntime();
    runtime.registerEnterpriseQuota({
      organizationId: 'org_acme',
      maxConcurrentExecutions: 1,
      maxAgentPoolSize: 5,
      priorityLevel: 1,
      costBudgetUsd: 100,
      currentCostUsd: 0
    });

    const context: ExecutionContextSnapshot = {
      executionId: 'exec_gate_1',
      workflowId: 'wf_gate',
      projectId: 'proj_gate',
      organizationId: 'org_acme',
      status: 'pending',
      currentStage: 'start',
      variables: { qualityScore: 85, videoTrack: 'hd_720p.mp4' },
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    const rules = [
      { id: 'gate_score', name: 'Min Quality Score', type: 'scoring' as const, minScore: 80 },
      { id: 'gate_asset', name: 'Required Asset', type: 'asset_completeness' as const, requiredFields: ['videoTrack'] }
    ];

    const gateResult = await QualityGateValidator.validateRules(rules, context);
    assert.equal(gateResult.passed, true);
    assert.equal(gateResult.scores['gate_score'], 85);
  });

  test('Execution Analytics & Performance Report Generation', async () => {
    const runtime = new AIExecutionRuntime();

    const graph: ExecutionGraph = {
      graphId: 'graph_analytics',
      name: 'Analytics Workflow',
      version: '1.0',
      nodes: {
        n1: {
          id: 'n1',
          name: 'Task 1',
          agentRole: 'custom',
          status: 'pending',
          dependencies: [],
          handler: async () => ({ a: 1 })
        }
      }
    };

    const initialContext: ExecutionContextSnapshot = {
      executionId: 'exec_ana_1',
      workflowId: 'wf_ana',
      projectId: 'proj_ana',
      status: 'pending',
      currentStage: 'start',
      variables: {},
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: { startTime: Date.now(), nodeDurationsMs: {}, retryCounts: {}, resourceUsage: { cpuUsagePercent: 0, memoryMb: 0 } }
    };

    const finalCtx = await runtime.runWorkflow(graph, initialContext);
    const report = runtime.getExecutionAnalytics(finalCtx);

    assert.equal(report.executionId, 'exec_ana_1');
    assert.ok(report.totalDurationMs >= 0);
    assert.equal(report.completedNodes, 1);
    assert.equal(report.aiProductivityScore, 100);
  });

});
