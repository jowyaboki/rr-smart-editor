import { create } from 'zustand';
import {
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  WorkflowTemplate,
  ValidationError,
  WorkflowContext,
} from '@ai-video-editor/shared';
import { ExecutionService } from '../execution/ExecutionService';
import { ValidationService } from '../services/ValidationService';
import { TemplateService } from '../services/TemplateService';

interface WorkflowState {
  workflows: Workflow[];
  executions: Record<string, WorkflowExecution>;
  templates: WorkflowTemplate[];

  activeWorkflowId: string | null;
  selectedStepId: string | null;
  validationErrors: ValidationError[];
  isInitialized: boolean;

  initializeStore: () => void;
  createWorkflow: (name: string, triggerType?: any) => Workflow;
  updateWorkflow: (workflowId: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (workflowId: string) => void;
  duplicateWorkflow: (workflowId: string) => Workflow;

  addStep: (workflowId: string, step: Omit<WorkflowStep, 'id'>) => WorkflowStep;
  removeStep: (workflowId: string, stepId: string) => void;
  updateStep: (workflowId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  duplicateStep: (workflowId: string, stepId: string) => WorkflowStep | null;
  connectSteps: (workflowId: string, sourceStepId: string, targetStepId: string) => void;
  validateWorkflowState: (workflowId: string) => ValidationError[];

  startWorkflow: (workflowId: string, initialContext?: Partial<WorkflowContext>) => Promise<WorkflowExecution>;
  pauseWorkflow: (executionId: string) => Promise<void>;
  resumeWorkflow: (workflowId: string, executionId: string) => Promise<void>;
  cancelWorkflow: (executionId: string) => Promise<void>;
  retryWorkflow: (workflowId: string, executionId: string) => Promise<void>;
  syncExecutions: () => void;

  instantiateFromTemplate: (templateId: string, customName?: string) => Workflow;
  importWorkflow: (jsonString: string) => Workflow;
  exportWorkflow: (workflowId: string) => string;

  setActiveWorkflowId: (id: string | null) => void;
  setSelectedStepId: (id: string | null) => void;
}

// Global flag to prevent registering redundant sync setInterval instances
let syncIntervalId: NodeJS.Timeout | null = null;

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  executions: {},
  templates: [],
  activeWorkflowId: null,
  selectedStepId: null,
  validationErrors: [],
  isInitialized: false,

  initializeStore: () => {
    if (get().isInitialized) return;

    TemplateService.initialize();
    const builtInTemplates = TemplateService.getAllTemplates();

    const defaultWfs: Workflow[] = [
      TemplateService.instantiateTemplate('tpl_auto_caption', 'Automated Scripting Flow'),
      TemplateService.instantiateTemplate('tpl_render_notify', 'Auto-Render Flow'),
    ];

    set({
      templates: builtInTemplates,
      workflows: defaultWfs,
      activeWorkflowId: defaultWfs[0]?.id || null,
      isInitialized: true,
    });

    if (!syncIntervalId) {
      syncIntervalId = setInterval(() => {
        get().syncExecutions();
      }, 1000);
    }
  },

  createWorkflow: (name, triggerType = 'manual') => {
    const newWf: Workflow = {
      id: 'wf_' + Math.random().toString(36).substr(2, 9),
      name,
      trigger: { type: triggerType },
      steps: [],
      variables: [
        { name: 'notifyTitle', type: 'string', value: 'Workflow Alert', scope: 'execution' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      workflows: [...state.workflows, newWf],
      activeWorkflowId: newWf.id,
    }));

    return newWf;
  },

  updateWorkflow: (workflowId, updates) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === workflowId
          ? { ...w, ...updates, updatedAt: new Date().toISOString() }
          : w
      ),
    }));
    get().validateWorkflowState(workflowId);
  },

  deleteWorkflow: (workflowId) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== workflowId),
      activeWorkflowId: state.activeWorkflowId === workflowId ? null : state.activeWorkflowId,
      selectedStepId: null,
    }));
  },

  duplicateWorkflow: (workflowId) => {
    const source = get().workflows.find((w) => w.id === workflowId);
    if (!source) throw new Error(`Workflow ${workflowId} not found`);

    const copy: Workflow = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'wf_' + Math.random().toString(36).substr(2, 9),
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      workflows: [...state.workflows, copy],
      activeWorkflowId: copy.id,
    }));

    return copy;
  },

  addStep: (workflowId, stepData) => {
    const stepId = 'step_' + Math.random().toString(36).substr(2, 9);
    const newStep: WorkflowStep = {
      ...stepData,
      id: stepId,
      collapsed: false,
    };

    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;

        const updatedSteps = [...w.steps];
        if (updatedSteps.length > 0) {
          const lastIndex = updatedSteps.length - 1;
          if (!updatedSteps[lastIndex].nextStepId) {
            updatedSteps[lastIndex] = {
              ...updatedSteps[lastIndex],
              nextStepId: stepId,
            };
          }
        }

        updatedSteps.push(newStep);

        return {
          ...w,
          steps: updatedSteps,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    get().validateWorkflowState(workflowId);
    return newStep;
  },

  removeStep: (workflowId, stepId) => {
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;

        let updatedSteps = w.steps.filter((s) => s.id !== stepId);

        updatedSteps = updatedSteps.map((s) => {
          let updated = { ...s };
          if (s.nextStepId === stepId) {
            updated.nextStepId = undefined;
          }
          if (s.type === 'condition') {
            const config = { ...s.config };
            if (config.ifTrueStepId === stepId) config.ifTrueStepId = undefined;
            if (config.ifFalseStepId === stepId) config.ifFalseStepId = undefined;
            updated.config = config;
          }
          return updated;
        });

        return {
          ...w,
          steps: updatedSteps,
          updatedAt: new Date().toISOString(),
        };
      }),
      selectedStepId: state.selectedStepId === stepId ? null : state.selectedStepId,
    }));

    get().validateWorkflowState(workflowId);
  },

  updateStep: (workflowId, stepId, updates) => {
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          steps: w.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    get().validateWorkflowState(workflowId);
  },

  duplicateStep: (workflowId, stepId) => {
    const wf = get().workflows.find((w) => w.id === workflowId);
    if (!wf) return null;

    const sourceStep = wf.steps.find((s) => s.id === stepId);
    if (!sourceStep) return null;

    const copyId = 'step_' + Math.random().toString(36).substr(2, 9);
    const copy: WorkflowStep = {
      ...JSON.parse(JSON.stringify(sourceStep)),
      id: copyId,
      name: `${sourceStep.name} (Copy)`,
      nextStepId: undefined,
    };

    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          steps: [...w.steps, copy],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    get().validateWorkflowState(workflowId);
    return copy;
  },

  connectSteps: (workflowId, sourceStepId, targetStepId) => {
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          steps: w.steps.map((s) => {
            if (s.id === sourceStepId) {
              return { ...s, nextStepId: targetStepId };
            }
            return s;
          }),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    get().validateWorkflowState(workflowId);
  },

  validateWorkflowState: (workflowId) => {
    const wf = get().workflows.find((w) => w.id === workflowId);
    if (!wf) return [];

    const errors = ValidationService.validateWorkflow(wf);
    set({ validationErrors: errors });
    return errors;
  },

  startWorkflow: async (workflowId, initialContext) => {
    const wf = get().workflows.find((w) => w.id === workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    const execution = await ExecutionService.startExecution(wf, initialContext);

    set((state) => ({
      executions: { ...state.executions, [execution.id]: { ...execution } },
    }));

    return execution;
  },

  pauseWorkflow: async (executionId) => {
    const execution = await ExecutionService.pauseExecution(executionId);
    set((state) => ({
      executions: { ...state.executions, [executionId]: { ...execution } },
    }));
  },

  resumeWorkflow: async (workflowId, executionId) => {
    const wf = get().workflows.find((w) => w.id === workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    const execution = await ExecutionService.resumeExecution(wf, executionId);
    set((state) => ({
      executions: { ...state.executions, [executionId]: { ...execution } },
    }));
  },

  cancelWorkflow: async (executionId) => {
    const execution = await ExecutionService.cancelExecution(executionId);
    set((state) => ({
      executions: { ...state.executions, [executionId]: { ...execution } },
    }));
  },

  retryWorkflow: async (workflowId, executionId) => {
    const wf = get().workflows.find((w) => w.id === workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    const execution = await ExecutionService.retryWorkflow(wf, executionId);
    set((state) => ({
      executions: { ...state.executions, [executionId]: { ...execution } },
    }));
  },

  syncExecutions: () => {
    const activeExecs = ExecutionService.getAllExecutions();
    if (activeExecs.length === 0) return;

    set((state) => {
      const updated: Record<string, WorkflowExecution> = { ...state.executions };
      let changed = false;

      activeExecs.forEach((ex) => {
        const existing = updated[ex.id];
        if (!existing || existing.status !== ex.status || existing.progress !== ex.progress || existing.history.length !== ex.history.length) {
          updated[ex.id] = { ...ex, history: [...ex.history] };
          changed = true;
        }
      });

      return changed ? { executions: updated } : {};
    });
  },

  instantiateFromTemplate: (templateId, customName) => {
    const newWf = TemplateService.instantiateTemplate(templateId, customName);
    set((state) => ({
      workflows: [...state.workflows, newWf],
      activeWorkflowId: newWf.id,
    }));
    return newWf;
  },

  importWorkflow: (jsonString) => {
    const newWf = TemplateService.importWorkflowFromJson(jsonString);
    set((state) => ({
      workflows: [...state.workflows, newWf],
      activeWorkflowId: newWf.id,
    }));
    return newWf;
  },

  exportWorkflow: (workflowId) => {
    const wf = get().workflows.find((w) => w.id === workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);
    return TemplateService.exportWorkflowToJson(wf);
  },

  setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),
  setSelectedStepId: (id) => set({ selectedStepId: id }),
}));
