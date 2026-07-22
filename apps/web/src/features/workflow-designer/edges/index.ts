import { WorkflowEdge } from '../types';

export const createDesignerEdge = (sourceId: string, targetId: string): WorkflowEdge => ({
  id: `edge-${Math.random().toString(36).substr(2, 9)}`,
  sourceNodeId: sourceId,
  targetNodeId: targetId,
});
