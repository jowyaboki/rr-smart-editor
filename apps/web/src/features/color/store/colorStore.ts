import { create } from 'zustand';
import { Grade, ColorPipeline, UIScopesState } from '../types';
import { globalColorScienceEngine } from '@ai-video-editor/color-science';

interface ColorState {
  activeGrade: Grade | null;
  pipeline: ColorPipeline | null;
  scopesState: UIScopesState;
  selectedWheel: 'lift' | 'gamma' | 'gain' | 'offset';
  isCalibrated: boolean;

  // Actions
  setGrade: (grade: Grade) => void;
  setPipeline: (pipeline: ColorPipeline) => void;
  updateScopesState: (scopes: Partial<UIScopesState>) => void;
  selectWheel: (wheel: 'lift' | 'gamma' | 'gain' | 'offset') => void;
  setCalibrated: (calibrated: boolean) => void;

  // Transaction-safe updates
  updateGradeLift: (rgb: [number, number, number]) => void;
  updateGradeGamma: (rgb: [number, number, number]) => void;
  updateGradeGain: (rgb: [number, number, number]) => void;
  updateGradeOffset: (rgb: [number, number, number]) => void;
  updateGradeCreative: (updates: Partial<{ contrast: number; Pivot: number; saturation: number; temperature: number; tint: number }>) => void;
}

export const useColorStore = create<ColorState>((set, get) => ({
  activeGrade: null,
  pipeline: null,
  scopesState: {
    activeScope: 'rgb_parade',
    subSampleRate: 8,
    falseColorOverlay: false,
  },
  selectedWheel: 'lift',
  isCalibrated: false,

  setGrade: (activeGrade) => set({ activeGrade }),
  setPipeline: (pipeline) => set({ pipeline }),
  updateScopesState: (scopes) => set((state) => ({
    scopesState: { ...state.scopesState, ...scopes },
  })),
  selectWheel: (selectedWheel) => set({ selectedWheel }),
  setCalibrated: (isCalibrated) => set({ isCalibrated }),

  updateGradeLift: (rgb) => set((state) => {
    if (!state.activeGrade) return {};
    const updated = {
      ...state.activeGrade,
      lift: { ...state.activeGrade.lift, rgb },
      updatedAt: new Date().toISOString(),
    };
    globalColorScienceEngine.publish('GradeLiftChanged', rgb);
    return { activeGrade: updated };
  }),

  updateGradeGamma: (rgb) => set((state) => {
    if (!state.activeGrade) return {};
    const updated = {
      ...state.activeGrade,
      gamma: { ...state.activeGrade.gamma, rgb },
      updatedAt: new Date().toISOString(),
    };
    globalColorScienceEngine.publish('GradeGammaChanged', rgb);
    return { activeGrade: updated };
  }),

  updateGradeGain: (rgb) => set((state) => {
    if (!state.activeGrade) return {};
    const updated = {
      ...state.activeGrade,
      gain: { ...state.activeGrade.gain, rgb },
      updatedAt: new Date().toISOString(),
    };
    globalColorScienceEngine.publish('GradeGainChanged', rgb);
    return { activeGrade: updated };
  }),

  updateGradeOffset: (rgb) => set((state) => {
    if (!state.activeGrade) return {};
    const updated = {
      ...state.activeGrade,
      offset: { ...state.activeGrade.offset, rgb },
      updatedAt: new Date().toISOString(),
    };
    globalColorScienceEngine.publish('GradeOffsetChanged', rgb);
    return { activeGrade: updated };
  }),

  updateGradeCreative: (updates) => set((state) => {
    if (!state.activeGrade) return {};
    const updated = {
      ...state.activeGrade,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    globalColorScienceEngine.publish('CreativeGradeUpdated', updates);
    return { activeGrade: updated };
  }),
}));
