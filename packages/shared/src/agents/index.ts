import { z } from 'zod';

export type AgentType =
  | 'project'
  | 'script'
  | 'storyboard'
  | 'timeline'
  | 'media'
  | 'animation'
  | 'caption'
  | 'audio'
  | 'rendering'
  | 'quality';

export type AgentStatus = 'idle' | 'busy' | 'error';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  capabilities: string[];
  status: AgentStatus;
}

export interface AgentTask {
  id: string;
  name: string;
  assignedAgent: AgentType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  logs: string[];
  output?: any;
  error?: string;
  createdAt: number;
}

export interface AgentMemory {
  projectId: string;
  context: {
    timeline?: any;
    assets?: any[];
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  intermediateOutputs: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentType: AgentType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
  currentStepIndex: number;
}

// Zod validation schemas
export const AgentTypeSchema = z.enum([
  'project',
  'script',
  'storyboard',
  'timeline',
  'media',
  'animation',
  'caption',
  'audio',
  'rendering',
  'quality',
]);

export const AgentStatusSchema = z.enum(['idle', 'busy', 'error']);

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: AgentTypeSchema,
  capabilities: z.array(z.string()),
  status: AgentStatusSchema,
});

export const AgentTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  assignedAgent: AgentTypeSchema,
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  progress: z.number().min(0).max(100),
  logs: z.array(z.string()),
  output: z.any().optional(),
  error: z.string().optional(),
  createdAt: z.number(),
});

export const AgentMemorySchema = z.object({
  projectId: z.string(),
  context: z.object({
    timeline: z.any().optional(),
    assets: z.array(z.any()).optional(),
    conversationHistory: z.array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    ),
  }),
  intermediateOutputs: z.record(z.string(), z.any()),
});

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  agentType: AgentTypeSchema,
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
});

export const AgentWorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  steps: z.array(WorkflowStepSchema),
  currentStepIndex: z.number().nonnegative(),
});
