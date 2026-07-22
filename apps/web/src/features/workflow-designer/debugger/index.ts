import { WorkflowDesigner } from '../services';

const designer = new WorkflowDesigner();

export const toggleNodeBreakpoint = (nodeId: string, enabled: boolean) => {
  designer.debug.toggleBreakpoint(nodeId, enabled);
};
export const getActiveNodeLogs = (nodeId: string) => {
  return designer.debug.getLogsForNode(nodeId);
};
export const recordNodeDebugLog = (nodeId: string, level: 'info' | 'warn' | 'error', message: string) => {
  designer.debug.logNodeEvent(nodeId, level, message);
};
export const stepNodeForward = () => {
  designer.debug.incrementStep();
  return designer.debug.getStepIndex();
};
