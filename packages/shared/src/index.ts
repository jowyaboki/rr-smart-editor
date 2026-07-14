import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  timeline: any;
  templateId?: string;
}

export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  timeline: z.any().optional(),
});

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  timeline: z.any().optional(),
});

export * from './ai';
export * from './recovery';
export * from './performance';
export * from './release';
export * from './collaboration';
export * from './agents';
