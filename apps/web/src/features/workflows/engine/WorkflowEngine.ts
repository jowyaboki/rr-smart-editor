import {
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  WorkflowContext,
  WorkflowResult,
  WorkflowVariable,
  ExecutionStatus,
} from '@ai-video-editor/shared';
import { WorkflowRegistry } from '../services/WorkflowRegistry';

export class WorkflowEngineError extends Error {
  constructor(public stepId: string, message: string) {
    super(message);
    this.name = 'WorkflowEngineError';
  }
}

export class WorkflowCancellationError extends Error {
  constructor(message = 'Execution cancelled') {
    super(message);
    this.name = 'WorkflowCancellationError';
  }
}

export class WorkflowPauseError extends Error {
  constructor(message = 'Execution paused') {
    super(message);
    this.name = 'WorkflowPauseError';
  }
}

export class WorkflowEngine {
  private static activeDelayResolvers = new Map<string, { resolve: () => void; timeout: NodeJS.Timeout }>();

  /**
   * Evaluates and substitutes variables in any string value.
   * Format: ${variable_name} or {{variable_name}}, supporting nested dotted paths like loopItem.name
   */
  public static resolveVariables(value: any, context: WorkflowContext): any {
    if (typeof value === 'string') {
      return value.replace(/\$\{([\w.]+)\}|\{\{([\w.]+)\}\}/g, (_, g1, g2) => {
        const key = g1 || g2;

        // Deep lookup for dotted paths (e.g. loopItem.name)
        const parts = key.split('.');
        let current: any = context.variables;
        let found = true;

        for (const part of parts) {
          if (current !== null && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            found = false;
            break;
          }
        }

        if (found) {
          return typeof current === 'object' ? JSON.stringify(current) : String(current);
        }

        if (key in context.env) {
          return context.env[key];
        }

        return `\$\{${key}\}`;
      });
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.resolveVariables(item, context));
    }

    if (value !== null && typeof value === 'object') {
      const resolvedObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        resolvedObj[k] = this.resolveVariables(v, context);
      }
      return resolvedObj;
    }

    return value;
  }

  /**
   * Helper to verify if the execution is still active.
   * Throws cancellation or pause errors to halt flow.
   */
  private static checkStatus(execution: WorkflowExecution): void {
    if (execution.status === 'cancelled') {
      throw new WorkflowCancellationError();
    }
    if (execution.status === 'paused') {
      throw new WorkflowPauseError();
    }
  }

  /**
   * Executes a specific step inside a workflow execution.
   */
  public static async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
  ): Promise<any> {
    this.checkStatus(execution);
    const context = execution.context;

    // Resolve variable references in step configurations
    const resolvedConfig = this.resolveVariables(step.config, context);

    switch (step.type) {
      case 'condition': {
        const { field, operator, value, ifTrueStepId, ifFalseStepId } = resolvedConfig;
        const fieldValue = context.variables[field];

        let conditionMet = false;
        switch (operator) {
          case 'equals':
          case '==':
            conditionMet = String(fieldValue) === String(value);
            break;
          case 'not_equals':
          case '!=':
            conditionMet = String(fieldValue) !== String(value);
            break;
          case 'contains':
            conditionMet = typeof fieldValue === 'string' && fieldValue.includes(value);
            break;
          case 'greater_than':
          case '>':
            conditionMet = Number(fieldValue) > Number(value);
            break;
          case 'less_than':
          case '<':
            conditionMet = Number(fieldValue) < Number(value);
            break;
          default:
            conditionMet = !!fieldValue;
        }

        const nextStepId = conditionMet ? ifTrueStepId : ifFalseStepId;
        return {
          success: true,
          output: { conditionMet, nextStepId },
          nextStepId,
        };
      }

      case 'loop': {
        const { iterations, items, steps, outputVariable } = resolvedConfig;
        const loopSteps: WorkflowStep[] = steps || [];
        const results: any[] = [];

        const count = items ? (Array.isArray(items) ? items.length : 0) : Number(iterations || 0);
        const list = Array.isArray(items) ? items : Array.from({ length: count }, (_, i) => i);

        for (let index = 0; index < list.length; index++) {
          this.checkStatus(execution);
          const currentItem = list[index];

          // Push loop index/item variables to context scope
          context.variables['loopIndex'] = index;
          context.variables['loopItem'] = currentItem;

          // Run each child step in sequence
          const stepResults: any[] = [];
          for (const loopStep of loopSteps) {
            this.checkStatus(execution);
            const stepRes = await this.executeStep(loopStep, execution);
            stepResults.push(stepRes);
          }
          results.push(stepResults);
        }

        if (outputVariable) {
          context.variables[outputVariable] = results;
        }

        return { success: true, output: { loopCount: count, results } };
      }

      case 'delay': {
        const durationMs = Number(resolvedConfig.durationMs || 1000);
        await new Promise<void>((resolve, reject) => {
          let checkInterval: NodeJS.Timeout;

          const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            this.activeDelayResolvers.delete(execution.id);
            resolve();
          }, durationMs);

          this.activeDelayResolvers.set(execution.id, {
            resolve: () => {
              clearTimeout(timeout);
              clearInterval(checkInterval);
              resolve();
            },
            timeout,
          });

          checkInterval = setInterval(() => {
            if (execution.status === 'cancelled') {
              clearTimeout(timeout);
              clearInterval(checkInterval);
              this.activeDelayResolvers.delete(execution.id);
              reject(new WorkflowCancellationError());
            } else if (execution.status === 'paused') {
              clearTimeout(timeout);
              clearInterval(checkInterval);
              this.activeDelayResolvers.delete(execution.id);
              reject(new WorkflowPauseError());
            }
          }, 100);
        });

        return { success: true, output: { delayedMs: durationMs } };
      }

      case 'transform': {
        const { input, outputVariable, expression } = resolvedConfig;
        let transformed = input;

        if (expression === 'uppercase') {
          transformed = String(input).toUpperCase();
        } else if (expression === 'lowercase') {
          transformed = String(input).toLowerCase();
        } else if (expression === 'json_parse') {
          try {
            transformed = JSON.parse(input);
          } catch {
            transformed = input;
          }
        } else if (expression === 'json_stringify') {
          transformed = JSON.stringify(input);
        }

        if (outputVariable) {
          context.variables[outputVariable] = transformed;
        }

        return { success: true, output: transformed };
      }

      case 'command': {
        const { actionId, arguments: actionArgs } = resolvedConfig;
        const actionDef = WorkflowRegistry.getAction(actionId);
        if (!actionDef) {
          throw new WorkflowEngineError(step.id, `Action command ${actionId} not found in WorkflowRegistry`);
        }
        const output = await actionDef.handler(actionArgs || {}, context);
        return { success: true, output };
      }

      case 'script': {
        const { scriptCode, outputVariable } = resolvedConfig;
        try {
          const fn = new Function('context', `
            try {
              ${scriptCode}
            } catch (err) {
              throw err;
            }
          `);
          const result = fn(context);
          if (outputVariable && result !== undefined) {
            context.variables[outputVariable] = result;
          }
          return { success: true, output: result };
        } catch (err: any) {
          throw new WorkflowEngineError(step.id, `JavaScript execution error: ${err.message}`);
        }
      }

      case 'ai_task': {
        const { prompt, taskType, outputVariable } = resolvedConfig;
        const API_URL = context.env.VITE_API_URL || 'http://localhost:3001';

        let output: any = null;

        if (typeof fetch !== 'undefined') {
          try {
            let endpoint = '/ai/generate-script';
            if (taskType === 'image') endpoint = '/ai/generate-image';
            if (taskType === 'voiceover') endpoint = '/ai/generate-voiceover';

            const res = await fetch(`${API_URL}${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt, projectId: context.projectId }),
            });

            if (res.ok) {
              output = await res.json();
            } else {
              output = { content: `Simulated AI output for prompt: "${prompt}"` };
            }
          } catch {
            output = { content: `Simulated AI output for prompt: "${prompt}"` };
          }
        } else {
          output = { content: `Simulated AI output for prompt: "${prompt}"` };
        }

        if (outputVariable) {
          context.variables[outputVariable] = output;
        }

        return { success: true, output };
      }

      case 'render': {
        const { projectId, outputVariable } = resolvedConfig;
        const activeProjectId = projectId || context.projectId;
        if (!activeProjectId) {
          throw new WorkflowEngineError(step.id, 'No active project ID specified for render step');
        }

        const actionDef = WorkflowRegistry.getAction('render_video');
        if (!actionDef) {
          throw new WorkflowEngineError(step.id, 'Render Action handler not found in registry');
        }

        const renderResult = await actionDef.handler({ projectId: activeProjectId }, context);
        if (outputVariable) {
          context.variables[outputVariable] = renderResult;
        }
        return { success: true, output: renderResult };
      }

      case 'notification': {
        const { title, message, level } = resolvedConfig;
        const logMsg = `[Notification - ${level || 'info'}] ${title}: ${message}`;
        console.log(logMsg);

        if (typeof window !== 'undefined') {
          const event = new CustomEvent('workflow-notification', {
            detail: { title, message, level: level || 'info' },
          });
          window.dispatchEvent(event);
        }

        return { success: true, output: logMsg };
      }

      default: {
        const customStepDef = WorkflowRegistry.getStepType(step.type);
        if (customStepDef) {
          const output = await customStepDef.executor(resolvedConfig, context);
          return { success: true, output };
        }
        throw new WorkflowEngineError(step.id, `Unknown step type: ${step.type}`);
      }
    }
  }

  /**
   * Resume/Interrupt active delay timers
   */
  public static forceResolveDelay(executionId: string): void {
    const resolver = this.activeDelayResolvers.get(executionId);
    if (resolver) {
      resolver.resolve();
      this.activeDelayResolvers.delete(executionId);
    }
  }
}
