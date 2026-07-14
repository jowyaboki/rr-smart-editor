import { create } from 'zustand';
import { Agent, AgentTask, AgentWorkflow, AgentType } from '@ai-video-editor/shared';
import { AgentRegistry } from '../services/AgentRegistry';
import { AgentOrchestrator } from '../services/AgentOrchestrator';

export interface AgentsStoreState {
  agents: Agent[];
  activeTasks: AgentTask[];
  activeWorkflows: AgentWorkflow[];
  selectedTaskId: string | null;
  isGenerating: boolean;

  // Actions
  loadAgents: () => void;
  runTask: (
    projectId: string,
    name: string,
    agentType: AgentType,
    inputPayload?: any,
  ) => Promise<AgentTask>;
  runWorkflow: (projectId: string, name: string, prompt: string) => Promise<AgentWorkflow>;
  cancelTask: (taskId: string) => void;
  setSelectedTaskId: (id: string | null) => void;
}

export const useAgentsStore = create<AgentsStoreState>((set, get) => ({
  agents: [],
  activeTasks: [],
  activeWorkflows: [],
  selectedTaskId: null,
  isGenerating: false,

  loadAgents: () => {
    AgentRegistry.initializeStandardAgents();
    set({ agents: AgentRegistry.getAllAgents() });
  },

  runTask: async (projectId, name, agentType, inputPayload) => {
    set({ isGenerating: true });

    // Set agent status to busy
    const agent = AgentRegistry.getAgentByType(agentType);
    if (agent) {
      AgentRegistry.updateStatus(agent.id, 'busy');
    }

    const task = await AgentOrchestrator.delegateTask({
      projectId,
      taskName: name,
      agentType,
      inputPayload,
    });

    set((state) => ({
      activeTasks: [task, ...state.activeTasks],
      selectedTaskId: task.id,
      agents: AgentRegistry.getAllAgents(), // sync status
    }));

    // Start poll timer
    const pollId = setInterval(() => {
      const updatedTask = AgentOrchestrator.getTask(task.id);
      if (updatedTask) {
        set((state) => ({
          activeTasks: state.activeTasks.map((t) => (t.id === task.id ? { ...updatedTask } : t)),
        }));

        if (
          updatedTask.status === 'completed' ||
          updatedTask.status === 'failed' ||
          updatedTask.status === 'cancelled'
        ) {
          clearInterval(pollId);
          if (agent) {
            AgentRegistry.updateStatus(agent.id, 'idle');
          }
          set({
            isGenerating: false,
            agents: AgentRegistry.getAllAgents(),
          });
        }
      }
    }, 100);

    return task;
  },

  runWorkflow: async (projectId, name, prompt) => {
    set({ isGenerating: true });

    const workflow = await AgentOrchestrator.executeWorkflow(projectId, name, prompt);

    set((state) => ({
      activeWorkflows: [workflow, ...state.activeWorkflows],
    }));

    // Start workflow state polling
    const pollId = setInterval(() => {
      const updatedWf = AgentOrchestrator.getWorkflow(workflow.id);
      if (updatedWf) {
        set((state) => ({
          activeWorkflows: state.activeWorkflows.map((w) =>
            w.id === workflow.id ? { ...updatedWf } : w,
          ),
          activeTasks: AgentOrchestrator.getAllTasks(), // sync any nested sub-tasks
        }));

        if (updatedWf.status === 'completed' || updatedWf.status === 'failed') {
          clearInterval(pollId);
          set({ isGenerating: false });
        }
      }
    }, 100);

    return workflow;
  },

  cancelTask: (taskId) => {
    AgentOrchestrator.cancelTask(taskId);
    const updated = AgentOrchestrator.getTask(taskId);
    if (updated) {
      set((state) => ({
        activeTasks: state.activeTasks.map((t) => (t.id === taskId ? { ...updated } : t)),
        isGenerating: false,
      }));
    }
  },

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
}));
