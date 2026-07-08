import { z } from 'zod';

export const AIScriptSchema = z.object({
  content: z.string(),
});

export const AISceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.number(),
});

export const AISubtitleSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

export const AIVoiceoverSchema = z.object({
  url: z.string(),
  duration: z.number().optional(),
});

export const AIGeneratedImageSchema = z.object({
  url: z.string(),
});

export type AIScript = z.infer<typeof AIScriptSchema>;
export type AIScene = z.infer<typeof AISceneSchema>;
export type AISubtitle = z.infer<typeof AISubtitleSchema>;
export type AIVoiceover = z.infer<typeof AIVoiceoverSchema>;
export type AIGeneratedImage = z.infer<typeof AIGeneratedImageSchema>;

export const AIRequestSchema = z.object({
  prompt: z.string().optional(),
  text: z.string().optional(),
  projectId: z.string().optional(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;

export interface AIResponse<T> {
  data: T;
  error?: string;
}
