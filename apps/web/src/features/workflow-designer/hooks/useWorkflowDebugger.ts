import { useDesignerStore } from '../store/designerStore';
import { toggleNodeBreakpoint, stepNodeForward, recordNodeDebugLog } from '../debugger';

export function useWorkflowDebugger() {
  const store = useDesignerStore();

  const toggleBreakpointAndStore = (nodeId: string) => {
    const isCurrentlyEnabled = store.breakpoints.includes(nodeId);
    toggleNodeBreakpoint(nodeId, !isCurrentlyEnabled);
    store.toggleBreakpoint(nodeId);
  };

  const startDebuggingSession = () => {
    store.setDebugging(true);
    if (store.nodes.length > 0) {
      store.setActiveStepNodeId(store.nodes[0].id);
      store.updateExecutionStep(store.nodes[0].id, { status: 'paused', startTime: Date.now() });
      recordNodeDebugLog(store.nodes[0].id, 'info', 'Debugger paused at breakpoint step.');
    }
  };

  const executeSingleStepForward = () => {
    if (!store.activeStepNodeId) return;

    // Resolve current node
    const currentId = store.activeStepNodeId;
    store.updateExecutionStep(currentId, { status: 'completed', endTime: Date.now() });

    // Step forward
    const nextIdx = stepNodeForward();
    if (nextIdx < store.nodes.length) {
      const nextId = store.nodes[nextIdx].id;
      store.setActiveStepNodeId(nextId);
      store.updateExecutionStep(nextId, { status: 'paused', startTime: Date.now() });
      recordNodeDebugLog(nextId, 'info', 'Step completed. Advancing to next breakpoint.');
    } else {
      store.setActiveStepNodeId(null);
      store.setDebugging(false);
    }
  };

  return {
    activeStepNodeId: store.activeStepNodeId,
    breakpoints: store.breakpoints,
    isDebugging: store.isDebugging,
    executionSteps: store.executionSteps,
    toggleBreakpoint: toggleBreakpointAndStore,
    startDebuggingSession,
    executeStepForward: executeSingleStepForward,
    stopDebugging: store.clearDebuggerState,
  };
}
