import { create } from 'zustand';
import { DEFAULT_TEMPLATES } from '../services/DefaultTemplates';
import { Template, TemplateCategory, TemplateFilter } from '../types';

interface TemplateStore {
  templates: Template[];
  selectedTemplateId: string | null;
  categories: TemplateCategory[];
  filters: TemplateFilter;
  loading: boolean;

  fetchTemplates: () => Promise<void>;
  selectTemplate: (id: string | null) => void;
  setFilters: (filters: Partial<TemplateFilter>) => void;
  toggleFavorite: (id: string) => void;
  saveAsTemplate: (project: any, metadata: any) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: DEFAULT_TEMPLATES,
  selectedTemplateId: null,
  categories: [
    { id: 'social', name: 'Social Media' },
    { id: 'business', name: 'Business' },
    { id: 'education', name: 'Education' },
  ],
  filters: {
    search: '',
    category: null,
    favoriteOnly: false,
    sortBy: 'recent',
  },
  loading: false,

  fetchTemplates: async () => {
    set({ loading: true });
    // Simulate API fetch
    set({ loading: false });
  },

  selectTemplate: (selectedTemplateId) => set({ selectedTemplateId }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  toggleFavorite: (id) => set((state) => ({
    templates: state.templates.map(t => t.id === id ? { ...t, favorite: !t.favorite } : t)
  })),

  saveAsTemplate: async (project, metadata) => {
    const newTemplate: Template = {
      id: Math.random().toString(36).substr(2, 9),
      metadata: {
        name: project.name,
        description: '',
        category: 'General',
        author: 'User',
        tags: [],
        version: '1.0.0',
        ...metadata
      },
      variables: [],
      versions: [{
        id: 'v1',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        timeline: project.timeline
      }],
      currentVersionId: 'v1',
      thumbnail: project.thumbnail || '',
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ templates: [...state.templates, newTemplate] }));
  },
}));
