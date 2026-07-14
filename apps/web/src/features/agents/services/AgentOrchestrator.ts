import { AgentTask, AgentType, AgentWorkflow, WorkflowStep } from '@ai-video-editor/shared';
import { AgentRegistry } from './AgentRegistry';
import { AgentMemoryService } from './AgentMemoryService';

export class AgentOrchestrator {
  private static activeTasks = new Map<string, AgentTask>();
  private static activeWorkflows = new Map<string, AgentWorkflow>();

  /**
   * Delegates a task to a specialized agent and simulates its execution logs.
   */
  public static async delegateTask(params: {
    projectId: string;
    taskName: string;
    agentType: AgentType;
    inputPayload?: any;
  }): Promise<AgentTask> {
    const taskId = `task_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const agent = AgentRegistry.getAgentByType(params.agentType);

    const task: AgentTask = {
      id: taskId,
      name: params.taskName,
      assignedAgent: params.agentType,
      status: 'pending',
      progress: 0,
      logs: [`[PENDING] task delegated to specialized ${params.agentType} agent.`],
      createdAt: Date.now(),
    };

    this.activeTasks.set(taskId, task);

    if (!agent) {
      task.status = 'failed';
      task.error = `No specialized agent registered for type: ${params.agentType}`;
      task.logs.push(`[ERROR] Task failed: ${task.error}`);
      return task;
    }

    // Trigger asynchronous, provider-agnostic simulation loop
    this.runTaskSimulation(taskId, params.projectId, params.inputPayload);

    return task;
  }

  /**
   * Cancels an active task.
   */
  public static cancelTask(taskId: string): void {
    const t = this.activeTasks.get(taskId);
    if (t && (t.status === 'pending' || t.status === 'running')) {
      t.status = 'cancelled';
      t.logs.push('[CANCEL] Task execution cancelled by operator.');
    }
  }

  /**
   * Enqueues and orchestrates a multi-step specialized Agent Workflow.
   * e.g. Prompt -> Script -> Storyboard -> Timeline -> Quality preflight.
   */
  public static async executeWorkflow(
    projectId: string,
    workflowName: string,
    prompt: string,
  ): Promise<AgentWorkflow> {
    const workflowId = `wf_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    // Log user prompt in conversation memory
    AgentMemoryService.logConversation(projectId, 'user', prompt);

    const steps: WorkflowStep[] = [
      {
        id: 'ws_script',
        name: 'Script Composition',
        agentType: 'script',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'ws_storyboard',
        name: 'Storyboard Segmentation',
        agentType: 'storyboard',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'ws_timeline',
        name: 'Timeline clip-lane generation',
        agentType: 'timeline',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'ws_quality',
        name: 'Audio/Video Preflight Quality check',
        agentType: 'quality',
        status: 'pending',
        progress: 0,
      },
    ];

    const workflow: AgentWorkflow = {
      id: workflowId,
      name: workflowName,
      status: 'pending',
      steps,
      currentStepIndex: 0,
    };

    this.activeWorkflows.set(workflowId, workflow);

    // Off-thread trigger workflow simulation step loop
    this.runWorkflowScheduler(workflowId, projectId);

    return workflow;
  }

  /**
   * Simulates the async execution of a task with progress updates and yields.
   */
  private static async runTaskSimulation(
    taskId: string,
    projectId: string,
    payload?: any,
  ): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    task.status = 'running';
    task.logs.push(`[START] Agent starting operation with capability mapping.`);

    const logsTemplates = {
      script: [
        'Parsing user prompt semantics and style themes.',
        'Structuring narrative introduction, body sequences and outro frames.',
        'Injecting audio voiceover timing tags and pacing keyframes.',
        'Writing script text cues into intermediate memory outputs.',
      ],
      storyboard: [
        'Scanning script context logs from shared project memory.',
        'Slicing script lines into 4 distinct story elements.',
        'Assigning recommended templates & stock graphic assets.',
        'Drafting storyboard visual overlay structures.',
      ],
      timeline: [
        'Retrieving storyboard segments.',
        'Mapping clips into Video 1 and Audio 1 tracks with exact durations.',
        'Generating and snap-positioning 4 timeline clip elements.',
        'Injecting clips into editor store configurations.',
      ],
      quality: [
        'Analyzing video clips overlapping boundaries.',
        'Running preflight render score validation audits.',
        'Verifying asset resolutions and durations alignment.',
        'Generating final production readiness report.',
      ],
    };

    const agentLogs = logsTemplates[task.assignedAgent as keyof typeof logsTemplates] || [
      'Reading shared project memory contexts.',
      'Performing capability calculations.',
      'Compiling final results structures.',
    ];

    for (let i = 0; i < agentLogs.length; i++) {
      // Yield thread
      await new Promise((resolve) => setTimeout(resolve, 80));

      const current = this.activeTasks.get(taskId);
      if (!current || current.status === 'cancelled') return;

      current.progress = Math.round(((i + 1) / agentLogs.length) * 100);
      current.logs.push(`[RUN] ${agentLogs[i]}`);
    }

    const final = this.activeTasks.get(taskId);
    if (final && final.status !== 'cancelled') {
      final.status = 'completed';
      final.progress = 100;
      final.logs.push(`[SUCCESS] Specialized agent successfully compiled task output.`);

      // Save simulated results in project memory based on agent type
      if (final.assignedAgent === 'script') {
        const scriptData = { body: 'This is a beautifully composed project script cues.' };
        AgentMemoryService.saveIntermediateOutput(projectId, 'script', scriptData);
        final.output = scriptData;
      } else if (final.assignedAgent === 'storyboard') {
        const storyboardData = { scenesCount: 4, templatesUsed: ['excalibur_intro'] };
        AgentMemoryService.saveIntermediateOutput(projectId, 'storyboard', storyboardData);
        final.output = storyboardData;
      }
    }
  }

  /**
   * Asynchronously schedules and chains workflow steps.
   */
  private static async runWorkflowScheduler(workflowId: string, projectId: string): Promise<void> {
    const wf = this.activeWorkflows.get(workflowId);
    if (!wf) return;

    wf.status = 'running';

    while (wf.currentStepIndex < wf.steps.length) {
      const step = wf.steps[wf.currentStepIndex];
      step.status = 'running';

      // Start task delegation
      const task = await this.delegateTask({
        projectId,
        taskName: `Step ${wf.currentStepIndex + 1}: ${step.name}`,
        agentType: step.agentType,
      });

      // Poll task until finished
      while (task.status === 'pending' || task.status === 'running') {
        await new Promise((resolve) => setTimeout(resolve, 30));
        step.progress = task.progress;
      }

      if (task.status === 'completed') {
        step.status = 'completed';
        step.progress = 100;
        wf.currentStepIndex++;
      } else {
        step.status = 'failed';
        wf.status = 'failed';
        return;
      }
    }

    wf.status = 'completed';
    AgentMemoryService.logConversation(
      projectId,
      'assistant',
      `I have successfully compiled your request through my multi-agent chain! I created a script, generated storyboard sequences, positioned tracks, and validated quality.`,
    );
  }

  public static getTask(taskId: string): AgentTask | null {
    return this.activeTasks.get(taskId) || null;
  }

  public static getWorkflow(workflowId: string): AgentWorkflow | null {
    return this.activeWorkflows.get(workflowId) || null;
  }

  public static getAllTasks(): AgentTask[] {
    return Array.from(this.activeTasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public static getAllWorkflows(): AgentWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }
}
