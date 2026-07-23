import { WorkflowDefinition } from '../types';

export const renderCanvasNodes = (wf: WorkflowDefinition) => {
  return wf.nodes.map(n => ({
    id: n.id,
    label: n.name,
    x: n.position.x,
    y: n.position.y,
  }));
};
