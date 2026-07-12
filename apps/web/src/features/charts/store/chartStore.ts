import { create } from 'zustand';
import { Chart } from '@ai-video-editor/shared';

interface ChartState {
  charts: Record<string, Chart>; // Keyed by clipId
  selectedChartId: string | null;

  setChart: (clipId: string, chart: Chart) => void;
  updateChart: (clipId: string, updates: Partial<Chart>) => void;
  removeChart: (clipId: string) => void;
  setSelectedChartId: (id: string | null) => void;
}

export const useChartStore = create<ChartState>((set) => ({
  charts: {},
  selectedChartId: null,

  setChart: (clipId, chart) => set((state) => ({
    charts: { ...state.charts, [clipId]: chart }
  })),

  updateChart: (clipId, updates) => set((state) => {
    const existing = state.charts[clipId];
    if (!existing) return state;
    return {
      charts: {
        ...state.charts,
        [clipId]: { ...existing, ...updates }
      }
    };
  }),

  removeChart: (clipId) => set((state) => {
    const { [clipId]: removed, ...rest } = state.charts;
    return { charts: rest };
  }),

  setSelectedChartId: (id) => set({ selectedChartId: id })
}));
