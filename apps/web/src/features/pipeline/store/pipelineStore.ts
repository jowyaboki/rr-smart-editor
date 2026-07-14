import { create } from 'zustand';
import {
  WorkflowStage,
  ProjectHealth,
  PipelineAnalytics,
  ExportChecklist
} from '@ai-video-editor/shared';

interface PipelineState {
  currentStage: WorkflowStage;
  health: ProjectHealth;
  analytics: PipelineAnalytics;
  checklist: ExportChecklist;

  setCurrentStage: (stage: WorkflowStage) => void;
  updateHealth: (updates: Partial<ProjectHealth>) => void;
  updateAnalytics: (updates: Partial<PipelineAnalytics>) => void;
  setChecklist: (checklist: ExportChecklist) => void;
  resetPipeline: () => void;
}

const initialHealth: ProjectHealth = {
  score: 100,
  warnings: 0,
  errors: 0,
  tips: [],
  lastChecked: new Date().toISOString()
};

const initialAnalytics: PipelineAnalytics = {
  editingTime: 0,
  assetUsage: {},
  timelineStats: { clipCount: 0, trackCount: 0, duration: 0 },
  renderHistory: []
};

const initialChecklist: ExportChecklist = {
  readyItems: [],
  warnings: [],
  blockingErrors: [],
  isReady: false
};

export const usePipelineStore = create<PipelineState>((set) => ({
  currentStage: 'project',
  health: initialHealth,
  analytics: initialAnalytics,
  checklist: initialChecklist,

  setCurrentStage: (stage) => set({ currentStage: stage }),
  updateHealth: (updates) => set((state) => ({
    health: { ...state.health, ...updates, lastChecked: new Date().toISOString() }
  })),
  updateAnalytics: (updates) => set((state) => ({
    analytics: { ...state.analytics, ...updates }
  })),
  setChecklist: (checklist) => set({ checklist }),
  resetPipeline: () => set({
    currentStage: 'project',
    health: initialHealth,
    checklist: initialChecklist
  })
}));
