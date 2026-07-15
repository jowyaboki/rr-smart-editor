import { Workflow, WorkflowStep } from '@ai-video-editor/shared';

export interface ValidationError {
  severity: 'error' | 'warning';
  message: string;
  stepId?: string;
}

export class ValidationService {
  /**
   * Performs full validation on a Workflow.
   * Returns a list of validation errors/warnings.
   */
  public static validateWorkflow(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!workflow.name || workflow.name.trim() === '') {
      errors.push({
        severity: 'error',
        message: 'Workflow name cannot be empty.',
      });
    }

    if (workflow.steps.length === 0) {
      errors.push({
        severity: 'warning',
        message: 'Workflow has no steps. It will do nothing when triggered.',
      });
      return errors;
    }

    // 1. Detect orphaned steps (steps with no incoming links except the first one)
    const stepIds = new Set(workflow.steps.map((s) => s.id));
    const linkedStepIds = new Set<string>();

    workflow.steps.forEach((step) => {
      if (step.nextStepId) {
        linkedStepIds.add(step.nextStepId);
      }
      if (step.type === 'condition') {
        if (step.config.ifTrueStepId) linkedStepIds.add(step.config.ifTrueStepId);
        if (step.config.ifFalseStepId) linkedStepIds.add(step.config.ifFalseStepId);
      }
    });

    const firstStepId = workflow.steps[0].id;
    workflow.steps.forEach((step) => {
      if (step.id !== firstStepId && !linkedStepIds.has(step.id)) {
        errors.push({
          severity: 'warning',
          message: `Step "${step.name}" (${step.id}) is orphaned (no preceding steps point to it).`,
          stepId: step.id,
        });
      }
    });

    // 2. Validate nextStepIds point to existing steps
    workflow.steps.forEach((step) => {
      if (step.nextStepId && !stepIds.has(step.nextStepId)) {
        errors.push({
          severity: 'error',
          message: `Step "${step.name}" points to non-existent step: ${step.nextStepId}`,
          stepId: step.id,
        });
      }
      if (step.type === 'condition') {
        if (step.config.ifTrueStepId && !stepIds.has(step.config.ifTrueStepId)) {
          errors.push({
            severity: 'error',
            message: `Condition True branch points to non-existent step: ${step.config.ifTrueStepId}`,
            stepId: step.id,
          });
        }
        if (step.config.ifFalseStepId && !stepIds.has(step.config.ifFalseStepId)) {
          errors.push({
            severity: 'error',
            message: `Condition False branch points to non-existent step: ${step.config.ifFalseStepId}`,
            stepId: step.id,
          });
        }
      }
    });

    // 3. Cycle/Loop connection check (using DFS)
    const hasCycle = this.detectCycles(workflow);
    if (hasCycle) {
      errors.push({
        severity: 'error',
        message: 'Infinite connection loop detected in step flow. Workflow would crash or loop endlessly.',
      });
    }

    // 4. Validate variable placeholders, supporting dotted nested properties
    const declaredVariables = new Set(workflow.variables.map((v) => v.name));
    declaredVariables.add('loopIndex');
    declaredVariables.add('loopItem');
    declaredVariables.add('lastCreatedProjectId');

    workflow.steps.forEach((step) => {
      const configStr = JSON.stringify(step.config);
      const matches = [...configStr.matchAll(/\$\{([\w.]+)\}|\{\{([\w.]+)\}\}/g)];

      matches.forEach((match) => {
        const key = match[1] || match[2];
        const baseKey = key.split('.')[0]; // Resolve base variable name for validation
        if (!declaredVariables.has(baseKey) && baseKey !== 'VITE_API_URL') {
          errors.push({
            severity: 'warning',
            message: `Step uses variable "${key}" which is not explicitly declared in this workflow or context.`,
            stepId: step.id,
          });
        }
      });
    });

    // 5. Check Step Configuration Syntaxes
    workflow.steps.forEach((step) => {
      if (step.type === 'delay' && (!step.config.durationMs || isNaN(Number(step.config.durationMs)))) {
        errors.push({
          severity: 'error',
          message: 'Delay step requires a numeric "durationMs" in its configuration.',
          stepId: step.id,
        });
      }
      if (step.type === 'script' && (!step.config.scriptCode || step.config.scriptCode.trim() === '')) {
        errors.push({
          severity: 'error',
          message: 'Script step requires non-empty "scriptCode" in its configuration.',
          stepId: step.id,
        });
      }
      if (step.type === 'command' && (!step.config.actionId || step.config.actionId.trim() === '')) {
        errors.push({
          severity: 'error',
          message: 'Command step requires an "actionId" in its configuration.',
          stepId: step.id,
        });
      }
      if (step.type === 'ai_task' && (!step.config.prompt || step.config.prompt.trim() === '')) {
        errors.push({
          severity: 'error',
          message: 'AI Task step requires a non-empty "prompt" in its configuration.',
          stepId: step.id,
        });
      }
    });

    return errors;
  }

  /**
   * DFS Cycle detection algorithm.
   */
  private static detectCycles(workflow: Workflow): boolean {
    const steps = workflow.steps;
    const visited: Record<string, 'unvisited' | 'visiting' | 'visited'> = {};

    steps.forEach((s) => {
      visited[s.id] = 'unvisited';
    });

    const stepMap = new Map<string, WorkflowStep>();
    steps.forEach((s) => stepMap.set(s.id, s));

    const checkCycleDFS = (stepId: string): boolean => {
      visited[stepId] = 'visiting';

      const step = stepMap.get(stepId);
      if (step) {
        const neighbors: string[] = [];
        if (step.nextStepId) neighbors.push(step.nextStepId);

        if (step.type === 'condition') {
          if (step.config.ifTrueStepId) neighbors.push(step.config.ifTrueStepId);
          if (step.config.ifFalseStepId) neighbors.push(step.config.ifFalseStepId);
        }

        for (const n of neighbors) {
          if (!visited[n]) visited[n] = 'unvisited';

          if (visited[n] === 'visiting') {
            return true;
          }
          if (visited[n] === 'unvisited') {
            if (checkCycleDFS(n)) {
              return true;
            }
          }
        }
      }

      visited[stepId] = 'visited';
      return false;
    };

    for (const step of steps) {
      if (visited[step.id] === 'unvisited') {
        if (checkCycleDFS(step.id)) {
          return true;
        }
      }
    }

    return false;
  }
}
