import { useAIExecutionStore } from '../store/aiExecutionStore';

export function useAIExecution() {
  const store = useAIExecutionStore();

  return {
    runtime: store.runtime,
    activeContext: store.activeContext,
    activeGraph: store.activeGraph,
    events: store.events,
    checkpoints: store.checkpoints,
    analytics: store.analytics,
    isExecuting: store.isExecuting,

    startExecution: store.startExecution,
    pauseExecution: store.pauseExecution,
    resumeExecution: store.resumeExecution,
    cancelExecution: store.cancelExecution,
    restoreCheckpoint: store.restoreCheckpoint,
    resolveApproval: store.resolveApproval,
    refreshAnalytics: store.refreshAnalytics
  };
}
