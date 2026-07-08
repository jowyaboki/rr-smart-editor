import { useMutation } from '@tanstack/react-query';
import { AIScript, AIGeneratedImage, AIVoiceover, AIRequest } from '@ai-video-editor/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useGenerateScript = () => {
  return useMutation(async (request: AIRequest) => {
    const res = await fetch(`${API_URL}/ai/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to generate script');
    }
    return res.json() as Promise<AIScript>;
  });
};

export const useGenerateImage = () => {
  return useMutation(async (request: AIRequest) => {
    const res = await fetch(`${API_URL}/ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to generate image');
    }
    return res.json() as Promise<AIGeneratedImage>;
  });
};

export const useGenerateVoice = () => {
  return useMutation(async (request: AIRequest) => {
    const res = await fetch(`${API_URL}/ai/generate-voiceover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to generate voiceover');
    }
    return res.json() as Promise<AIVoiceover>;
  });
};
