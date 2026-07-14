import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';

export const useProjects = () => {
  const { projects, loading, error, fetchProjects, deleteProject, duplicateProject, toggleFavorite } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    deleteProject,
    duplicateProject,
    toggleFavorite,
  };
};
