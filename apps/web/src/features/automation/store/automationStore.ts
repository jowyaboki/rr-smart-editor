import { create } from 'zustand';
import {
  BatchJob,
  BatchItem,
  AutomationTemplate,
  AutomationPreset
} from '@ai-video-editor/shared';

interface AutomationState {
  templates: AutomationTemplate[];
  presets: AutomationPreset[];
  activeBatchJobs: BatchJob[];
  completedBatchJobs: BatchJob[];
  batchItems: Record<string, BatchItem[]>; // Keyed by batchId

  addTemplate: (template: AutomationTemplate) => void;
  addPreset: (preset: AutomationPreset) => void;
  addBatchJob: (job: BatchJob) => void;
  updateBatchJob: (id: string, updates: Partial<BatchJob>) => void;
  setBatchItems: (batchId: string, items: BatchItem[]) => void;
  updateBatchItem: (batchId: string, itemId: string, updates: Partial<BatchItem>) => void;
}

export const useAutomationStore = create<AutomationState>((set) => ({
  templates: [],
  presets: [],
  activeBatchJobs: [],
  completedBatchJobs: [],
  batchItems: {},

  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template]
  })),

  addPreset: (preset) => set((state) => ({
    presets: [...state.presets, preset]
  })),

  addBatchJob: (job) => set((state) => ({
    activeBatchJobs: [job, ...state.activeBatchJobs]
  })),

  updateBatchJob: (id, updates) => set((state) => {
    const isActive = state.activeBatchJobs.some(j => j.id === id);
    if (isActive) {
      const activeBatchJobs = state.activeBatchJobs.map(j =>
        j.id === id ? { ...j, ...updates } : j
      );

      // If completed, move to completedBatchJobs
      const job = activeBatchJobs.find(j => j.id === id);
      if (job && (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')) {
        return {
          activeBatchJobs: activeBatchJobs.filter(j => j.id !== id),
          completedBatchJobs: [job, ...state.completedBatchJobs]
        };
      }

      return { activeBatchJobs };
    }
    return {
      completedBatchJobs: state.completedBatchJobs.map(j =>
        j.id === id ? { ...j, ...updates } : j
      )
    };
  }),

  setBatchItems: (batchId, items) => set((state) => ({
    batchItems: { ...state.batchItems, [batchId]: items }
  })),

  updateBatchItem: (batchId, itemId, updates) => set((state) => {
    const items = state.batchItems[batchId] || [];
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    return {
      batchItems: { ...state.batchItems, [batchId]: updatedItems }
    };
  })
}));
