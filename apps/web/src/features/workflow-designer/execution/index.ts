import { WorkflowDesigner } from '../services';

const designer = new WorkflowDesigner();

export const compileToExecutionEngine = (wf: any) => {
  return designer.bridge.compileToWorkflowEngineDefinition(wf);
};
