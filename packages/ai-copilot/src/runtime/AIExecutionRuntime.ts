import {
  ExecutionGraph,
  ExecutionContextSnapshot,
  CheckpointSnapshot,
  RuntimeEvent,
  EnterpriseQuota
} from './types';
import { ExecutionEngine } from './ExecutionEngine';
import { DependencyResolver } from './DependencyResolver';
import { JobScheduler } from './JobScheduler';
import { ICheckpointStore, IndexedDBCheckpointStore } from './CheckpointManager';
import { ProgressTracker, EventListener } from './ProgressTracker';
import { RollbackManager } from './RollbackManager';
import { CancellationManager } from './CancellationManager';
import { EnterpriseOrchestrator } from './EnterpriseOrchestrator';
import { ExecutionAnalytics, PerformanceMetricsReport } from './ExecutionAnalytics';

export class AIExecutionRuntime {
  private engine: ExecutionEngine;
  private scheduler: JobScheduler;
  private checkpointStore: ICheckpointStore;
  private progressTracker: ProgressTracker;
  private cancellationManager: CancellationManager;
  private orchestrator: EnterpriseOrchestrator;

  constructor(options?: {
    concurrencyLimit?: number;
    checkpointStore?: ICheckpointStore;
  }) {
    this.scheduler = new JobScheduler(options?.concurrencyLimit || 10);
    this.checkpointStore = options?.checkpointStore || new IndexedDBCheckpointStore();
    this.progressTracker = new ProgressTracker();
    this.cancellationManager = new CancellationManager();
    this.orchestrator = new EnterpriseOrchestrator();

    this.engine = new ExecutionEngine({
      scheduler: this.scheduler,
      checkpointStore: this.checkpointStore,
      progressTracker: this.progressTracker,
      cancellationManager: this.cancellationManager,
      orchestrator: this.orchestrator
    });
  }

  registerEnterpriseQuota(quota: EnterpriseQuota): void {
    this.orchestrator.registerQuota(quota);
  }

  subscribeEvents(listener: EventListener): () => void {
    return this.progressTracker.subscribe(listener);
  }

  async runWorkflow(
    graph: ExecutionGraph,
    initialContext: ExecutionContextSnapshot
  ): Promise<ExecutionContextSnapshot> {
    return this.engine.executeGraph(graph, initialContext);
  }

  pauseWorkflow(context: ExecutionContextSnapshot): void {
    this.engine.pauseExecution(context);
  }

  resumeWorkflow(context: ExecutionContextSnapshot, graph: ExecutionGraph): Promise<ExecutionContextSnapshot> {
    return this.engine.resumeExecution(context, graph);
  }

  cancelWorkflow(executionId: string, reason?: string): void {
    this.cancellationManager.cancel(executionId, reason);
  }

  async restoreCheckpoint(
    context: ExecutionContextSnapshot,
    graph: ExecutionGraph,
    checkpointId: string
  ): Promise<ExecutionContextSnapshot> {
    const checkpoint = await this.checkpointStore.getCheckpoint(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint '${checkpointId}' not found`);
    }

    const updatedCtx = RollbackManager.rollbackToCheckpoint(context, graph, checkpoint);
    this.progressTracker.emit({
      executionId: context.executionId,
      type: 'checkpoint.restored',
      details: { checkpointId, stageName: checkpoint.stageName }
    });

    return updatedCtx;
  }

  async resolveApprovalGate(
    context: ExecutionContextSnapshot,
    graph: ExecutionGraph,
    nodeId: string,
    approved: boolean,
    approver?: string,
    feedback?: string
  ): Promise<ExecutionContextSnapshot> {
    return this.engine.resolveApproval(context, graph, nodeId, approved, approver, feedback);
  }

  getExecutionAnalytics(context: ExecutionContextSnapshot): PerformanceMetricsReport {
    const events = this.progressTracker.getEvents(context.executionId);
    return ExecutionAnalytics.analyzeExecution(context, events);
  }

  getEvents(executionId?: string): RuntimeEvent[] {
    return this.progressTracker.getEvents(executionId);
  }

  validateGraph(graph: ExecutionGraph): { valid: boolean; errors: string[] } {
    return DependencyResolver.validateGraph(graph);
  }
}
