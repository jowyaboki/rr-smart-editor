import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  name: string;
}

export * from './project';
export * from './ai';
export * from './media';
export * from './timeline';
export * from './remotion';

export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  timeline: z.any().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  fps: z.number().optional(),
  durationInFrames: z.number().optional(),
  backgroundColor: z.string().optional(),
});

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  timeline: z.any().optional(),
  favorite: z.boolean().optional(),
  description: z.string().optional(),
});
