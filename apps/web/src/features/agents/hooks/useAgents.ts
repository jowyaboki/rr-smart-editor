import { useCallback, useEffect } from 'react';
import { useAgentsStore } from '../store/agentsStore';

export const useAgents = () => {
  const store = useAgentsStore();

  useEffect(() => {
    // Standard initialization of agents list
    if (store.agents.length === 0) {
      store.loadAgents();
    }
  }, [store.agents.length, store.loadAgents]);

  return {
    agents: store.agents,
    activeTasks: store.activeTasks,
    activeWorkflows: store.activeWorkflows,
    selectedTaskId: store.selectedTaskId,
    isGenerating: store.isGenerating,

    // Actions
    runTask: store.runTask,
    runWorkflow: store.runWorkflow,
    cancelTask: store.cancelTask,
    setSelectedTaskId: store.setSelectedTaskId,
  };
};
