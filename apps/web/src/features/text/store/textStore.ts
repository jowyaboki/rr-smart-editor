import { create } from 'zustand';
import { TextObject, TextStyle, TextPreset } from '@ai-video-editor/shared';

interface TextState {
  textObjects: Record<string, TextObject>; // Keyed by clipId
  reusableStyles: TextStyle[];
  presets: TextPreset[];

  setTextObject: (clipId: string, textObj: TextObject) => void;
  updateTextObject: (clipId: string, updates: Partial<TextObject>) => void;
  addReusableStyle: (style: TextStyle) => void;
  updateReusableStyle: (id: string, updates: Partial<TextStyle>) => void;
  removeReusableStyle: (id: string) => void;
  setPresets: (presets: TextPreset[]) => void;
}

export const useTextStore = create<TextState>((set) => ({
  textObjects: {},
  reusableStyles: [],
  presets: [],

  setTextObject: (clipId, textObj) => set((state) => ({
    textObjects: { ...state.textObjects, [clipId]: textObj }
  })),

  updateTextObject: (clipId, updates) => set((state) => {
    const existing = state.textObjects[clipId];
    if (!existing) return state;
    return {
      textObjects: {
        ...state.textObjects,
        [clipId]: { ...existing, ...updates }
      }
    };
  }),

  addReusableStyle: (style) => set((state) => ({
    reusableStyles: [...state.reusableStyles, style]
  })),

  updateReusableStyle: (id, updates) => set((state) => ({
    reusableStyles: state.reusableStyles.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  removeReusableStyle: (id) => set((state) => ({
    reusableStyles: state.reusableStyles.filter(s => s.id !== id)
  })),

  setPresets: (presets) => set({ presets })
}));
