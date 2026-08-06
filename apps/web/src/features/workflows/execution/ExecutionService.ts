import {
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  WorkflowContext,
  WorkflowResult,
  ExecutionStatus,
} from '@ai-video-editor/shared';
import { WorkflowEngine } from '../engine/WorkflowEngine';

export class ExecutionService {
  private static executions = new Map<string, WorkflowExecution>();

  /**
   * Starts a brand new execution of a workflow.
   */
  public static async startExecution(
    workflow: Workflow,
    initialContext?: Partial<WorkflowContext>,
  ): Promise<WorkflowExecution> {
    const executionId = 'exec_' + Math.random().toString(36).substr(2, 9);

    const context: WorkflowContext = {
      variables: {},
      projectId: initialContext?.projectId,
      sceneId: initialContext?.sceneId,
      templateId: initialContext?.templateId,
      env: {
        VITE_API_URL: initialContext?.env?.VITE_API_URL || import.meta.env?.VITE_API_URL || 'http://localhost:3001',
        ...initialContext?.env,
      },
    };

    workflow.variables.forEach((v) => {
      context.variables[v.name] = v.value;
    });

    if (initialContext?.variables) {
      context.variables = { ...context.variables, ...initialContext.variables };
    }

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      status: 'running',
      context,
      history: [],
      progress: 0,
      startedAt: new Date().toISOString(),
    };

    this.executions.set(executionId, execution);

    this.runExecutionLoop(workflow, execution).catch((err) => {
      console.error(`Workflow execution ${executionId} background runner error:`, err);
    });

    return execution;
  }

  /**
   * Background runner loop that steps through workflow nodes.
   */
  private static async runExecutionLoop(
    workflow: Workflow,
    execution: WorkflowExecution,
    resumeStepId?: string,
  ): Promise<void> {
    const steps = workflow.steps;
    if (steps.length === 0) {
      execution.status = 'completed';
      execution.progress = 100;
      execution.endedAt = new Date().toISOString();
      return;
    }

    let currentStep: WorkflowStep | undefined = undefined;

    if (resumeStepId) {
      currentStep = steps.find((s) => s.id === resumeStepId);
    } else {
      currentStep = steps[0];
    }

    let runCount = execution.history.length;
    const totalSteps = steps.length;

    while (currentStep) {
      if (execution.status === 'paused' || execution.status === 'cancelled') {
        break;
      }

      execution.currentStepId = currentStep.id;
      runCount++;
      execution.progress = Math.min(95, Math.round((runCount / (totalSteps + 1)) * 100));

      try {
        const result = await WorkflowEngine.executeStep(currentStep, execution);

        const outcome: WorkflowResult = {
          stepId: currentStep.id,
          status: 'success',
          output: result.output,
          timestamp: new Date().toISOString(),
        };
        execution.history.push(outcome);

        if (result.nextStepId) {
          currentStep = steps.find((s) => s.id === result.nextStepId);
        } else if (currentStep.nextStepId) {
          currentStep = steps.find((s) => s.id === currentStep.nextStepId);
        } else {
          const currentIndex = steps.findIndex((s) => s.id === currentStep!.id);
          currentStep = steps[currentIndex + 1];
        }
      } catch (err: any) {
        if (err.name === 'WorkflowCancellationError') {
          execution.status = 'cancelled';
          execution.endedAt = new Date().toISOString();
          return;
        }

        if (err.name === 'WorkflowPauseError') {
          execution.status = 'paused';
          return;
        }

        const outcome: WorkflowResult = {
          stepId: currentStep.id,
          status: 'failed',
          error: err.message || String(err),
          timestamp: new Date().toISOString(),
        };
        execution.history.push(outcome);

        execution.status = 'failed';
        execution.endedAt = new Date().toISOString();
        return;
      }
    }

    if (execution.status === 'running') {
      execution.status = 'completed';
      execution.progress = 100;
      execution.endedAt = new Date().toISOString();
    }
  }

  /**
   * Pauses an active execution.
   */
  public static async pauseExecution(executionId: string): Promise<WorkflowExecution> {
    const exec = this.executions.get(executionId);
    if (!exec) throw new Error(`Execution ${executionId} not found`);

    if (exec.status === 'running') {
      exec.status = 'paused';
    }

    return exec;
  }

  /**
   * Resumes a paused execution.
   */
  public static async resumeExecution(workflow: Workflow, executionId: string): Promise<WorkflowExecution> {
    const exec = this.executions.get(executionId);
    if (!exec) throw new Error(`Execution ${executionId} not found`);

    if (exec.status !== 'paused') {
      return exec;
    }

    exec.status = 'running';

    const currentStepId = exec.currentStepId || workflow.steps[0]?.id;
    this.runExecutionLoop(workflow, exec, currentStepId).catch((err) => {
      console.error(`Workflow execution ${executionId} resume loop error:`, err);
    });

    return exec;
  }

  /**
   * Cancels a running or paused execution.
   */
  public static async cancelExecution(executionId: string): Promise<WorkflowExecution> {
    const exec = this.executions.get(executionId);
    if (!exec) throw new Error(`Execution ${executionId} not found`);

    exec.status = 'cancelled';
    exec.endedAt = new Date().toISOString();

    WorkflowEngine.forceResolveDelay(executionId);

    return exec;
  }

  /**
   * Retries a failed execution from the failed step.
   */
  public static async retryExecution(workflow: Workflow, executionId: string): Promise<WorkflowExecution> {
    const exec = this.executions.get(executionId);
    if (!exec) throw new Error(`Execution ${executionId} not found`);

    if (exec.status !== 'failed') {
      return exec;
    }

    exec.status = 'running';
    exec.endedAt = undefined;

    const failedStepId = exec.currentStepId || workflow.steps[0]?.id;

    if (exec.history.length > 0 && exec.history[exec.history.length - 1].status === 'failed') {
      exec.history.pop();
    }

    this.runExecutionLoop(workflow, exec, failedStepId).catch((err) => {
      console.error(`Workflow execution ${executionId} retry loop error:`, err);
    });

    return exec;
  }

  public static getExecution(executionId: string): WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  public static getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  public static clear(): void {
    this.executions.clear();
  }
}
