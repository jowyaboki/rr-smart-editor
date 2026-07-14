import { create } from 'zustand';
import { Project } from '../types';
import { ProjectRepository, LocalStorageRepository } from '../services/ProjectRepository';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  selectedProjectId: string | null;
  loading: boolean;
  error: string | null;
  repository: ProjectRepository;

  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  openProject: (id: string) => Promise<void>;
  closeProject: () => void;
  toggleFavorite: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  selectedProjectId: null,
  loading: false,
  error: null,
  repository: new LocalStorageRepository(),

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const projects = await get().repository.getAll();
      set({ projects, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createProject: async (data) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Untitled Project',
      description: data.description || '',
      width: data.width || 1920,
      height: data.height || 1080,
      fps: data.fps || 30,
      durationInFrames: data.durationInFrames || 300,
      backgroundColor: data.backgroundColor || '#000000',
      favorite: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: { tracks: [], playhead: 0, zoom: 1 },
      ...data,
    };
    const project = await get().repository.create(newProject);
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  updateProject: async (id, updates) => {
    const updated = await get().repository.update(id, updates);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
      currentProject: state.currentProject?.id === id ? updated : state.currentProject,
    }));
  },

  deleteProject: async (id) => {
    await get().repository.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  duplicateProject: async (id) => {
    const duplicated = await get().repository.duplicate(id);
    set((state) => ({ projects: [...state.projects, duplicated] }));
  },

  openProject: async (id) => {
    const project = await get().repository.getById(id);
    set({ currentProject: project, selectedProjectId: id });
  },

  closeProject: () => set({ currentProject: null, selectedProjectId: null }),

  toggleFavorite: async (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (project) {
      await get().updateProject(id, { favorite: !project.favorite });
    }
  },

  renameProject: async (id, name) => {
    await get().updateProject(id, { name });
  },
}));
