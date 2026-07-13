import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project } from '@ai-video-editor/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useProjects = () => {
  return useQuery<Project[]>(['projects'], async () => {
    const res = await fetch(`${API_URL}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (name: string) => {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      },
    },
  );
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update project');
      return res.json();
    },
    {
      onMutate: async (updatedProject) => {
        await queryClient.cancelQueries(['projects']);
        const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
        queryClient.setQueryData<Project[]>(['projects'], (old) =>
          old?.map((p) => (p.id === updatedProject.id ? { ...p, name: updatedProject.name } : p)),
        );
        return { previousProjects };
      },
      onError: (err, newProject, context: any) => {
        queryClient.setQueryData(['projects'], context.previousProjects);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['projects']);
      },
    },
  );
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      return res.json();
    },
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(['projects']);
        const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
        queryClient.setQueryData<Project[]>(['projects'], (old) => old?.filter((p) => p.id !== id));
        return { previousProjects };
      },
      onError: (err, id, context: any) => {
        queryClient.setQueryData(['projects'], context.previousProjects);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['projects']);
      },
    },
  );
};
