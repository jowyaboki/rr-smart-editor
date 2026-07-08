import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useTemplates = (category?: string) => {
  return useQuery(['templates', category], async () => {
    const url = category ? `${API_URL}/templates?category=${category}` : `${API_URL}/templates`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ name, projectId, category }: { name?: string; projectId: string; category?: string }) => {
      const res = await fetch(`${API_URL}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, projectId, category }),
      });
      if (!res.ok) throw new Error('Failed to create template');
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['templates']);
      },
    }
  );
};

export const useUseTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (templateId: string) => {
      const res = await fetch(`${API_URL}/templates/${templateId}/use`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to use template');
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      },
    }
  );
};
