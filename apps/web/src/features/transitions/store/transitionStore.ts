import { create } from 'zustand';
import { TransitionInstance, TransitionPreset } from '@ai-video-editor/shared';

interface TransitionState {
  instances: TransitionInstance[];
  presets: TransitionPreset[];
  selectedInstanceId: string | null;

  addInstance: (instance: TransitionInstance) => void;
  updateInstance: (id: string, updates: Partial<TransitionInstance>) => void;
  removeInstance: (id: string) => void;
  setSelectedInstanceId: (id: string | null) => void;
  setPresets: (presets: TransitionPreset[]) => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  instances: [],
  presets: [],
  selectedInstanceId: null,

  addInstance: (instance) => set((state) => ({
    instances: [...state.instances, instance]
  })),

  updateInstance: (id, updates) => set((state) => ({
    instances: state.instances.map(inst => inst.id === id ? { ...inst, ...updates } : inst)
  })),

  removeInstance: (id) => set((state) => ({
    instances: state.instances.filter(inst => inst.id !== id),
    selectedInstanceId: state.selectedInstanceId === id ? null : state.selectedInstanceId
  })),

  setSelectedInstanceId: (id) => set({ selectedInstanceId: id }),

  setPresets: (presets) => set({ presets })
}));
