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
export declare const ProjectCreateSchema: z.ZodObject<{
    name: z.ZodString;
    timeline: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const ProjectUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    timeline: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export * from './ai';
export * from './recovery';
export * from './performance';
export * from './release';
export * from './collaboration';
export * from './agents';
export * from './workflows';
export * from './render';
export { WorkflowStep, WorkflowStepSchema } from './workflows';
