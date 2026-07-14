import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Media {
  id: string;
  projectId: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export const useMedia = (projectId: string) => {
  return useQuery<Media[]>([['media', projectId]], async () => {
    const res = await fetch(`${API_URL}/projects/${projectId}/media`);
    if (!res.ok) throw new Error('Failed to fetch media');
    return res.json();
  });
};

export const useUploadMedia = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/projects/${projectId}/media`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload media');
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([['media', projectId]]);
      },
    },
  );
};
