import { create } from 'zustand';
import { WebTemplate } from '../types';

export interface TemplateState {
  templates: WebTemplate[];
  searchQuery: string;
  categoryFilter: string;
  parameterValues: Record<string, any>;
  currentPreviewFrame: string | null;
  loading: boolean;

  // Actions
  setTemplates: (templates: WebTemplate[]) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  updateParameterValue: (paramId: string, value: any) => void;
  setParameterValues: (values: Record<string, any>) => void;
  setPreviewFrame: (frame: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleInstalled: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clearForm: () => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [
    {
      id: 'tpl-promo',
      displayName: 'Corporate Business Promo',
      description: 'Clean professional business template blueprint with customizable text overlays and brand palette colors.',
      category: 'promo',
      version: '1.0.0',
      installed: false,
      isFavorite: false,
      rating: 4.6,
    },
    {
      id: 'tpl-social-shorts',
      displayName: 'Vibrant TikTok Shorts Grid',
      description: 'Fast-paced, modern social shorts template featuring text zoom effects and custom transitions.',
      category: 'social_media',
      version: '1.1.0',
      installed: true,
      isFavorite: true,
      rating: 4.9,
    }
  ],
  searchQuery: '',
  categoryFilter: 'all',
  parameterValues: {},
  currentPreviewFrame: null,
  loading: false,

  setTemplates: (templates) => set({ templates }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  updateParameterValue: (paramId, value) => set((state) => ({
    parameterValues: { ...state.parameterValues, [paramId]: value },
  })),

  setParameterValues: (parameterValues) => set({ parameterValues }),

  setPreviewFrame: (currentPreviewFrame) => set({ currentPreviewFrame }),

  toggleFavorite: (id) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ),
  })),

  toggleInstalled: (id) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id ? { ...t, installed: !t.installed } : t
    ),
  })),

  setLoading: (loading) => set({ loading }),

  clearForm: () => set({ parameterValues: {}, currentPreviewFrame: null }),
}));
