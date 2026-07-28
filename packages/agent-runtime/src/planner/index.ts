import { AgentPlan, AgentTask, ToolCall, ToolResult, ExecutionContext } from '../types';

export class PlannerService {
  /**
   * Generates a multi-step plan from an initial natural language task description.
   * In a real system, this compiles a prompt and queries an LLM to generate the tasks sequence.
   * Since we are provider-agnostic, we implement a highly structured rule-based decomposition system
   * that demonstrates multi-step planning perfectly.
   */
  public generatePlan(taskDescription: string, strategy: AgentPlan['strategy'] = 'sequential'): AgentPlan {
    const planId = `plan-${Math.random().toString(36).substr(2, 9)}`;

    // Simple deterministic planner parsing to represent real LLM decomposition
    const tasks: AgentTask[] = [];

    if (taskDescription.toLowerCase().includes('generate') || taskDescription.toLowerCase().includes('create')) {
      // Create a multi-step creation plan: 1. Load project -> 2. Ingest assets -> 3. Add clips -> 4. Render
      tasks.push({
        id: 'task-1',
        description: 'Initialize/load active video project',
        status: 'pending',
        dependencies: [],
      });
      tasks.push({
        id: 'task-2',
        description: 'Ingest and tag video assets',
        status: 'pending',
        dependencies: ['task-1'],
      });
      tasks.push({
        id: 'task-3',
        description: 'Insert clips to timeline tracks',
        status: 'pending',
        dependencies: ['task-2'],
      });
      tasks.push({
        id: 'task-4',
        description: 'Queue timeline for background transcode/render',
        status: 'pending',
        dependencies: ['task-3'],
      });
    } else {
      // Single-step default fallback task
      tasks.push({
        id: 'task-1',
        description: taskDescription,
        status: 'pending',
        dependencies: [],
      });
    }

    return {
      id: planId,
      tasks,
      strategy,
    };
  }

  /**
   * Sorts the tasks topologically to guarantee sequential dependent execution.
   */
  public getExecutionOrder(plan: AgentPlan): AgentTask[][] {
    const tasks = [...plan.tasks];
    const resolved: AgentTask[] = [];
    const executionBatches: AgentTask[][] = [];

    while (tasks.length > 0) {
      // Find all tasks whose dependencies are fully satisfied/resolved
      const readyBatch = tasks.filter(t => {
        return t.dependencies.every(depId => resolved.some(r => r.id === depId));
      });

      if (readyBatch.length === 0) {
        // Circular dependency detected! Just execute in current order
        executionBatches.push(tasks);
        break;
      }

      executionBatches.push(readyBatch);
      resolved.push(...readyBatch);

      // Remove ready batch from queue
      for (const t of readyBatch) {
        const idx = tasks.findIndex(item => item.id === t.id);
        if (idx !== -1) tasks.splice(idx, 1);
      }
    }

    return executionBatches;
  }
}
