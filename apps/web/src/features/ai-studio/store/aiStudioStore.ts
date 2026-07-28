import { create } from 'zustand';
import { AIProjectOutput } from '../types';

export interface AIStudioState {
  currentProject: AIProjectOutput | null;
  pipelineProgress: number; // 0 to 100
  pipelineStage: string;
  isGenerating: boolean;
  warnings: string[];

  // Actions
  setProject: (project: AIProjectOutput | null) => void;
  setProgress: (progress: number, stage: string) => void;
  setGenerating: (generating: boolean) => void;
  setWarnings: (warnings: string[]) => void;
  clear: () => void;
}

export const useAIStudioStore = create<AIStudioState>((set) => ({
  currentProject: null,
  pipelineProgress: 0,
  pipelineStage: 'idle',
  isGenerating: false,
  warnings: [],

  setProject: (currentProject) => set({ currentProject }),

  setProgress: (pipelineProgress, pipelineStage) => set({ pipelineProgress, pipelineStage }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setWarnings: (warnings) => set({ warnings }),

  clear: () => set({ currentProject: null, pipelineProgress: 0, pipelineStage: 'idle', isGenerating: false, warnings: [] }),
}));
