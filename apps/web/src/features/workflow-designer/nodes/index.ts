import { WorkflowNode } from '../types';

export const createDesignerNode = (type: string, name: string, x: number, y: number): WorkflowNode => ({
  id: `node-${Math.random().toString(36).substr(2, 9)}`,
  name,
  category: 'logic',
  type,
  config: {},
  position: { x, y },
});
