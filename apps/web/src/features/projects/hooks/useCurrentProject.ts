import { useProjectStore } from '../store/projectStore';

export const useCurrentProject = () => {
  const { currentProject, openProject, closeProject, updateProject } = useProjectStore();

  return {
    project: currentProject,
    openProject,
    closeProject,
    updateProject,
  };
};
