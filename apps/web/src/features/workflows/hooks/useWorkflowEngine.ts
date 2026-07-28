import { useWorkflowStore } from '../store/useWorkflowStore';
import { WorkflowContext } from '@ai-video-editor/shared';

export const useWorkflowEngine = () => {
  const store = useWorkflowStore();

  const handleStartWorkflow = async (workflowId: string, initialContext?: Partial<WorkflowContext>) => {
    return store.startWorkflow(workflowId, initialContext);
  };

  const handlePauseWorkflow = async (executionId: string) => {
    return store.pauseWorkflow(executionId);
  };

  const handleResumeWorkflow = async (workflowId: string, executionId: string) => {
    return store.resumeWorkflow(workflowId, executionId);
  };

  const handleCancelWorkflow = async (executionId: string) => {
    return store.cancelWorkflow(executionId);
  };

  const handleRetryWorkflow = async (workflowId: string, executionId: string) => {
    return store.retryWorkflow(workflowId, executionId);
  };

  const activeExecutionList = Object.values(store.executions).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return {
    workflows: store.workflows,
    executions: store.executions,
    activeExecutions: activeExecutionList,
    activeWorkflowId: store.activeWorkflowId,
    selectedStepId: store.selectedStepId,
    validationErrors: store.validationErrors,

    startWorkflow: handleStartWorkflow,
    pauseWorkflow: handlePauseWorkflow,
    resumeWorkflow: handleResumeWorkflow,
    cancelWorkflow: handleCancelWorkflow,
    retryWorkflow: handleRetryWorkflow,

    setActiveWorkflowId: store.setActiveWorkflowId,
    setSelectedStepId: store.setSelectedStepId,
    createWorkflow: store.createWorkflow,
    updateWorkflow: store.updateWorkflow,
    deleteWorkflow: store.deleteWorkflow,
    duplicateWorkflow: store.duplicateWorkflow,
    addStep: store.addStep,
    removeStep: store.removeStep,
    updateStep: store.updateStep,
    duplicateStep: store.duplicateStep,
    connectSteps: store.connectSteps,
    validateWorkflow: store.validateWorkflowState,

    templates: store.templates,
    instantiateFromTemplate: store.instantiateFromTemplate,
    importWorkflow: store.importWorkflow,
    exportWorkflow: store.exportWorkflow,
  };
};
