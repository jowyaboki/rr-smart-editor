import { useMutation, useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useTriggerRender = (projectId: string) => {
  return useMutation(async () => {
    const res = await fetch(`${API_URL}/renders/${projectId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger render');
    return res.json();
  });
};

export const useRenderStatus = (renderId?: string) => {
  return useQuery(
    ['render', renderId],
    async () => {
      const res = await fetch(`${API_URL}/renders/${renderId}`);
      if (!res.ok) throw new Error('Failed to fetch render status');
      return res.json();
    },
    {
      enabled: !!renderId,
      refetchInterval: (data: any) =>
        data?.status === 'rendering' || data?.status === 'queued' ? 2000 : false,
    },
  );
};
