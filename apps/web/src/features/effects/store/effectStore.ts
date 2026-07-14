import { create } from 'zustand';
import { EffectInstance, EffectPreset } from '@ai-video-editor/shared';

interface EffectState {
  clipEffects: Record<string, EffectInstance[]>; // Keyed by clipId
  presets: EffectPreset[];

  addEffectToClip: (clipId: string, effect: EffectInstance) => void;
  removeEffectFromClip: (clipId: string, instanceId: string) => void;
  updateEffectInstance: (clipId: string, instanceId: string, updates: Partial<EffectInstance>) => void;
  reorderEffects: (clipId: string, newOrder: EffectInstance[]) => void;
  setPresets: (presets: EffectPreset[]) => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  clipEffects: {},
  presets: [],

  addEffectToClip: (clipId, effect) => set((state) => ({
    clipEffects: {
      ...state.clipEffects,
      [clipId]: [...(state.clipEffects[clipId] || []), effect]
    }
  })),

  removeEffectFromClip: (clipId, instanceId) => set((state) => ({
    clipEffects: {
      ...state.clipEffects,
      [clipId]: (state.clipEffects[clipId] || []).filter(e => e.id !== instanceId)
    }
  })),

  updateEffectInstance: (clipId, instanceId, updates) => set((state) => ({
    clipEffects: {
      ...state.clipEffects,
      [clipId]: (state.clipEffects[clipId] || []).map(e =>
        e.id === instanceId ? { ...e, ...updates } : e
      )
    }
  })),

  reorderEffects: (clipId, newOrder) => set((state) => ({
    clipEffects: {
      ...state.clipEffects,
      [clipId]: newOrder
    }
  })),

  setPresets: (presets) => set({ presets })
}));
