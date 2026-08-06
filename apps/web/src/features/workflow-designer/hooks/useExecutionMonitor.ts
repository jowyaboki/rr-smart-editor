import { useDesignerStore } from '../store/designerStore';
import { recordNodePerformance, getNodePerformance } from '../monitoring';

export function useExecutionMonitor() {
  const store = useDesignerStore();

  const recordNodeRunMetrics = (nodeId: string, durationMs: number, memoryBytes: number, retries = 0) => {
    recordNodePerformance(nodeId, durationMs, memoryBytes, retries);
    store.updateExecutionStep(nodeId, { status: 'completed' });
  };

  const getNodeRunMetrics = (nodeId: string) => {
    return getNodePerformance(nodeId);
  };

  return {
    executionSteps: store.executionSteps,
    recordNodeRunMetrics,
    getNodeRunMetrics,
  };
}
