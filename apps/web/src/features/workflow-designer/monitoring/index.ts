import { WorkflowDesigner } from '../services';

const designer = new WorkflowDesigner();

export const recordNodePerformance = (nodeId: string, durationMs: number, memoryBytes: number, retries = 0) => {
  designer.monitoring.recordMetrics(nodeId, durationMs, memoryBytes, retries);
};
export const getNodePerformance = (nodeId: string) => {
  return designer.monitoring.getMetrics(nodeId);
};
