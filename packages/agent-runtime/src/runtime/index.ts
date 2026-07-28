import { Agent, AgentTask, AgentPlan, ToolCall, ToolResult, ConversationContext, ExecutionContext } from '../types';
import { PlannerService } from '../planner';
import { MemoryService } from '../memory';
import { ContextService } from '../context';
import { ExecutionService, ExecutionOptions } from '../execution';

export class AgentRuntime {
  public readonly planner = new PlannerService();
  public readonly memory = new MemoryService();
  public readonly contextManager = new ContextService();
  public readonly execution = new ExecutionService();

  constructor(initialContext?: Partial<ExecutionContext>) {
    if (initialContext) {
      this.contextManager.updateContext(initialContext);
    }
  }

  /**
   * Safe execution method to orchestrate multi-step conversational runs
   */
  public async executeAgentRun(
    userMessage: string,
    options?: ExecutionOptions
  ): Promise<{ textResponse: string; plan?: AgentPlan; toolResults: ToolResult[] }> {
    // 1. Record incoming user request to memory
    this.memory.addMessage('user', userMessage);

    const ctx = this.contextManager.getContext();

    // 2. Multi-step task decomposition and planning
    const plan = this.planner.generatePlan(userMessage);

    // 3. Topologically ordered batch execution
    const executionBatches = this.planner.getExecutionOrder(plan);
    const allResults: ToolResult[] = [];

    for (const batch of executionBatches) {
      if (this.contextManager.isCancelled()) {
        batch.forEach(t => { t.status = 'cancelled'; });
        break;
      }

      // Format tasks into execution tool calls
      const toolCalls: ToolCall[] = batch.map((task, idx) => {
        task.status = 'running';
        return {
          id: `call-${task.id}`,
          // Map tasks to our high-level capabilities
          toolName: this.mapTaskToToolName(task.description),
          arguments: { action: 'execute', taskDescription: task.description },
        };
      });

      // Execute batch concurrently/parallelly
      const batchResults = await this.execution.executeParallel(toolCalls, ctx, options);
      allResults.push(...batchResults);

      // Update task completion statuses
      batchResults.forEach((res, idx) => {
        const correspondingTask = batch[idx];
        if (res.success) {
          correspondingTask.status = 'completed';
          correspondingTask.result = res.result;
        } else {
          correspondingTask.status = 'failed';
          correspondingTask.error = res.error?.message;
        }
      });
    }

    // 4. Formulate visual explanation text and append assistant reply
    const responseText = this.formulateResponseText(plan, allResults);
    this.memory.addMessage('assistant', responseText);

    return {
      textResponse: responseText,
      plan,
      toolResults: allResults,
    };
  }

  /**
   * Maps textual descriptions to tool capability names in registry
   */
  private mapTaskToToolName(desc: string): string {
    const d = desc.toLowerCase();
    if (d.includes('timeline') || d.includes('clip')) return 'Timeline';
    if (d.includes('asset') || d.includes('media')) return 'Assets';
    if (d.includes('render')) return 'Render Queue';
    if (d.includes('playback') || d.includes('seek')) return 'Playback';
    if (d.includes('variable')) return 'Variables';
    if (d.includes('template')) return 'Templates';
    if (d.includes('node') || d.includes('expression')) return 'Node Graph';
    if (d.includes('scene')) return 'Scene';
    if (d.includes('effect')) return 'Effects';
    if (d.includes('publish')) return 'Publishing';
    return 'Project'; // Fallback
  }

  /**
   * Formulates descriptive user progress response
   */
  private formulateResponseText(plan: AgentPlan, results: ToolResult[]): string {
    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;

    let response = `I have analyzed your request and compiled a multi-step plan containing ${plan.tasks.length} tasks.\n\n`;
    response += `### Execution Status:\n`;
    plan.tasks.forEach(t => {
      const statusIcon = t.status === 'completed' ? '✅' : t.status === 'failed' ? '❌' : '⏳';
      response += `- ${statusIcon} **${t.description}** (${t.status.toUpperCase()})\n`;
    });

    if (failures > 0) {
      response += `\nWarning: ${failures} step(s) failed during execution. Please review the errors or adjust requirements.`;
    } else {
      response += `\nAll steps completed successfully. All editor modifications have been completed through secure runtime interfaces.`;
    }

    return response;
  }
}
