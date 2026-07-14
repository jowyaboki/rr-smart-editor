import { Project } from '../types';
import { useProjectStore } from '../store/projectStore';

export const ProjectService = {
  // This class currently delegates to the store, but can be expanded for complex validation/orchestration
  async create(data: Partial<Project>) {
    return useProjectStore.getState().createProject(data);
  },
  async update(id: string, updates: Partial<Project>) {
    return useProjectStore.getState().updateProject(id, updates);
  },
  async delete(id: string) {
    return useProjectStore.getState().deleteProject(id);
  },
  async duplicate(id: string) {
    return useProjectStore.getState().duplicateProject(id);
  },
  async toggleFavorite(id: string) {
    return useProjectStore.getState().toggleFavorite(id);
  },
};
