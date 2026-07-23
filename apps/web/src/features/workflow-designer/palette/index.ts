import { WorkflowDesigner } from '../services';

export const listPaletteNodeTypes = () => {
  const designer = new WorkflowDesigner();
  return designer.registry.listRegisteredNodeTypes();
};
