import {
  ExecutionGraph,
  ExecutionContextSnapshot,
  ExecutionStatus,
  NodeExecutionStatus,
  ArtifactReference,
  ApprovalGate,
  CheckpointSnapshot
} from './types';
import { DependencyResolver } from './DependencyResolver';
import { JobScheduler } from './JobScheduler';
import { ICheckpointStore, MemoryCheckpointStore } from './CheckpointManager';
import { ProgressTracker } from './ProgressTracker';
import { RetryManager } from './RetryManager';
import { CancellationManager } from './CancellationManager';
import { QualityGateValidator } from './QualityGateValidator';
import { EnterpriseOrchestrator } from './EnterpriseOrchestrator';

export class ExecutionEngine {
  private scheduler: JobScheduler;
  private checkpointStore: ICheckpointStore;
  private progressTracker: ProgressTracker;
  private cancellationManager: CancellationManager;
  private orchestrator: EnterpriseOrchestrator;

  constructor(options?: {
    scheduler?: JobScheduler;
    checkpointStore?: ICheckpointStore;
    progressTracker?: ProgressTracker;
    cancellationManager?: CancellationManager;
    orchestrator?: EnterpriseOrchestrator;
  }) {
    this.scheduler = options?.scheduler || new JobScheduler(10);
    this.checkpointStore = options?.checkpointStore || new MemoryCheckpointStore();
    this.progressTracker = options?.progressTracker || new ProgressTracker();
    this.cancellationManager = options?.cancellationManager || new CancellationManager();
    this.orchestrator = options?.orchestrator || new EnterpriseOrchestrator();
  }

  getTracker(): ProgressTracker {
    return this.progressTracker;
  }

  getCheckpointStore(): ICheckpointStore {
    return this.checkpointStore;
  }

  getCancellationManager(): CancellationManager {
    return this.cancellationManager;
  }

  async executeGraph(
    graph: ExecutionGraph,
    initialContext: ExecutionContextSnapshot
  ): Promise<ExecutionContextSnapshot> {
    const validation = DependencyResolver.validateGraph(graph);
    if (!validation.valid) {
      throw new Error(`Invalid execution graph: ${validation.errors.join(', ')}`);
    }

    if (initialContext.organizationId) {
      const check = this.orchestrator.canExecute(initialContext.organizationId);
      if (!check.allowed) {
        throw new Error(check.reason);
      }
      this.orchestrator.trackExecutionStart(initialContext.organizationId, initialContext.executionId);
    }

    const signal = this.cancellationManager.createToken(initialContext.executionId);
    const context: ExecutionContextSnapshot = JSON.parse(JSON.stringify(initialContext));
    if (context.status !== 'waiting_for_approval' && context.status !== 'paused') {
      context.status = 'running';
    }
    context.metrics.startTime = Date.now();

    this.progressTracker.emit({
      executionId: context.executionId,
      type: 'execution.started',
      details: { graphId: graph.graphId, workflowId: context.workflowId }
    });

    const completedNodeIds = new Set<string>();
    const runningNodeIds = new Set<string>();

    for (const [id, node] of Object.entries(graph.nodes)) {
      if (node.status === 'completed' || node.status === 'skipped') {
        completedNodeIds.add(id);
      }
    }

    try {
      while (completedNodeIds.size < Object.keys(graph.nodes).length) {
        if (this.cancellationManager.isCancelled(context.executionId)) {
          context.status = 'cancelled';
          this.progressTracker.emit({
            executionId: context.executionId,
            type: 'execution.cancelled'
          });
          break;
        }

        if (context.status === 'paused' || context.status === 'waiting_for_approval') {
          break;
        }

        const readyNodes = DependencyResolver.getExecutableNodes(graph, completedNodeIds, runningNodeIds);

        if (readyNodes.length === 0) {
          if (runningNodeIds.size > 0) {
            await new Promise(resolve => setTimeout(resolve, 20));
            continue;
          }

          const remainingNodes = Object.values(graph.nodes).filter(
            n => !completedNodeIds.has(n.id) && n.status !== 'cancelled' && n.status !== 'failed'
          );

          if (remainingNodes.length === 0) {
            break;
          }

          const failedNodes = Object.values(graph.nodes).filter(n => n.status === 'failed' && !n.isOptional);
          if (failedNodes.length > 0) {
            context.status = 'failed';
            this.progressTracker.emit({
              executionId: context.executionId,
              type: 'execution.failed',
              details: { error: failedNodes[0].error }
            });
            break;
          }
          break;
        }

        let pausedOrWaiting = false;

        const promises = readyNodes.map(async node => {
          runningNodeIds.add(node.id);
          node.status = 'running';
          node.startedAt = new Date().toISOString();
          node.attempts = (node.attempts || 0) + 1;

          this.progressTracker.emit({
            executionId: context.executionId,
            type: 'node.started',
            nodeId: node.id,
            details: { attempts: node.attempts }
          });

          if (node.approvalGate && node.approvalGate.status === 'pending') {
            context.status = 'waiting_for_approval';
            node.status = 'waiting_for_approval';
            pausedOrWaiting = true;
            this.progressTracker.emit({
              executionId: context.executionId,
              type: 'approval.requested',
              nodeId: node.id,
              details: { approvalGate: node.approvalGate }
            });
            runningNodeIds.delete(node.id);
            return;
          }

          const nodeStartTime = Date.now();
          try {
            const output = await this.scheduler.scheduleNode(node, context, signal);

            if (node.qualityGates && node.qualityGates.length > 0) {
              const gateResult = await QualityGateValidator.validateRules(node.qualityGates, context);
              if (!gateResult.passed) {
                throw new Error(`Quality gate validation failed: ${gateResult.errors.join('; ')}`);
              }
            }

            node.status = 'completed';
            node.completedAt = new Date().toISOString();
            completedNodeIds.add(node.id);

            const duration = Date.now() - nodeStartTime;
            context.metrics.nodeDurationsMs[node.id] = duration;

            if (output && typeof output === 'object') {
              Object.assign(context.variables, output);
            }

            this.progressTracker.emit({
              executionId: context.executionId,
              type: 'node.completed',
              nodeId: node.id,
              details: { durationMs: duration, output }
            });

            await this.createCheckpoint(context, graph, node.id);

          } catch (err: any) {
            const errorMsg = err.message || String(err);
            node.error = errorMsg;

            context.errors.push({
              timestamp: new Date().toISOString(),
              nodeId: node.id,
              message: errorMsg
            });

            if (RetryManager.shouldRetry(node, node.attempts || 1, errorMsg)) {
              context.metrics.retryCounts[node.id] = (context.metrics.retryCounts[node.id] || 0) + 1;
              this.progressTracker.emit({
                executionId: context.executionId,
                type: 'retry.started',
                nodeId: node.id,
                details: { attempt: node.attempts, delay: RetryManager.getBackoffDelay(node, node.attempts || 1) }
              });
              node.status = 'pending';
            } else if (node.fallbackNodeId && graph.nodes[node.fallbackNodeId]) {
              node.status = 'failed';
              completedNodeIds.add(node.id);
            } else if (node.isOptional) {
              node.status = 'skipped';
              completedNodeIds.add(node.id);
            } else {
              node.status = 'failed';
              this.progressTracker.emit({
                executionId: context.executionId,
                type: 'node.failed',
                nodeId: node.id,
                details: { error: errorMsg }
              });
            }
          } finally {
            runningNodeIds.delete(node.id);
          }
        });

        await Promise.all(promises);

        if (pausedOrWaiting) {
          break;
        }
      }

      if (context.status === 'running') {
        const allSuccess = Object.values(graph.nodes).every(
          n => n.status === 'completed' || n.status === 'skipped' || n.isOptional
        );
        context.status = allSuccess ? 'completed' : 'failed';
        context.metrics.endTime = Date.now();
        context.metrics.totalDurationMs = context.metrics.endTime - context.metrics.startTime;

        this.progressTracker.emit({
          executionId: context.executionId,
          type: allSuccess ? 'execution.completed' : 'execution.failed'
        });
      }

    } finally {
      if (initialContext.organizationId) {
        this.orchestrator.trackExecutionEnd(initialContext.organizationId, initialContext.executionId);
      }
      this.cancellationManager.cleanup(context.executionId);
    }

    return context;
  }

  async createCheckpoint(
    context: ExecutionContextSnapshot,
    graph: ExecutionGraph,
    stageName: string
  ): Promise<CheckpointSnapshot> {
    const graphState: CheckpointSnapshot['graphState'] = {};
    for (const [id, node] of Object.entries(graph.nodes)) {
      graphState[id] = {
        status: node.status,
        attempts: node.attempts || 0,
        error: node.error
      };
    }

    const checkpoint: CheckpointSnapshot = {
      checkpointId: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      executionId: context.executionId,
      timestamp: new Date().toISOString(),
      stageName,
      graphState,
      contextData: JSON.parse(JSON.stringify(context.variables)),
      artifacts: JSON.parse(JSON.stringify(context.artifacts)),
      approvals: JSON.parse(JSON.stringify(context.approvals))
    };

    context.checkpoints.push(checkpoint);
    await this.checkpointStore.saveCheckpoint(checkpoint);

    this.progressTracker.emit({
      executionId: context.executionId,
      type: 'checkpoint.created',
      details: { checkpointId: checkpoint.checkpointId, stageName }
    });

    return checkpoint;
  }

  async resolveApproval(
    context: ExecutionContextSnapshot,
    graph: ExecutionGraph,
    nodeId: string,
    approved: boolean,
    approver?: string,
    feedback?: string
  ): Promise<ExecutionContextSnapshot> {
    const node = graph.nodes[nodeId];
    if (!node || !node.approvalGate) {
      throw new Error(`Node '${nodeId}' has no active approval gate`);
    }

    node.approvalGate.status = approved ? 'approved' : 'rejected';
    node.approvalGate.approver = approver;
    node.approvalGate.decisionAt = new Date().toISOString();
    node.approvalGate.feedback = feedback;

    this.progressTracker.emit({
      executionId: context.executionId,
      type: approved ? 'approval.granted' : 'approval.rejected',
      nodeId,
      details: { approver, feedback }
    });

    if (approved) {
      context.status = 'running';
      node.status = 'pending';
      return this.executeGraph(graph, context);
    } else {
      context.status = 'failed';
      node.status = 'failed';
      node.error = `Approval rejected: ${feedback || 'No feedback provided'}`;
      return context;
    }
  }

  pauseExecution(context: ExecutionContextSnapshot): void {
    context.status = 'paused';
    this.progressTracker.emit({
      executionId: context.executionId,
      type: 'execution.paused'
    });
  }

  resumeExecution(context: ExecutionContextSnapshot, graph: ExecutionGraph): Promise<ExecutionContextSnapshot> {
    context.status = 'running';
    this.progressTracker.emit({
      executionId: context.executionId,
      type: 'execution.resumed'
    });
    return this.executeGraph(graph, context);
  }
}
