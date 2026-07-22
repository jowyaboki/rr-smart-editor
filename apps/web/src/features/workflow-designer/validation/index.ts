import { WorkflowDesigner } from '../services';

const designer = new WorkflowDesigner();

export const validateLayoutDefinition = (wf: any) => {
  return designer.validation.validateWorkflow(wf);
};
