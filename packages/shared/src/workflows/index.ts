import { z } from 'zod';

export type WorkflowStepType =
  | 'condition'
  | 'loop'
  | 'delay'
  | 'transform'
  | 'command'
  | 'script'
  | 'ai_task'
  | 'render'
  | 'notification';

export type TriggerType =
  | 'manual'
  | 'project_open'
  | 'project_save'
  | 'render_complete'
  | 'asset_imported'
  | 'timeline_changed'
  | 'template_applied'
  | 'webhook';

export type VariableScope = 'project' | 'scene' | 'template' | 'environment' | 'execution';

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  value: any;
  scope: VariableScope;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: Record<string, any>;
  nextStepId?: string;
  collapsed?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowResult {
  stepId: string;
  status: 'success' | 'failed';
  output?: any;
  error?: string;
  timestamp: string;
}

export interface WorkflowContext {
  variables: Record<string, any>;
  projectId?: string;
  sceneId?: string;
  templateId?: string;
  env: Record<string, string>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  currentStepId?: string;
  context: WorkflowContext;
  history: WorkflowResult[];
  progress: number; // 0 to 100
  startedAt: string;
  endedAt?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workflow: Omit<Workflow, 'id'>;
  category?: string;
}

// Zod schemas
export const WorkflowStepTypeSchema = z.enum([
  'condition',
  'loop',
  'delay',
  'transform',
  'command',
  'script',
  'ai_task',
  'render',
  'notification',
]);

export const TriggerTypeSchema = z.enum([
  'manual',
  'project_open',
  'project_save',
  'render_complete',
  'asset_imported',
  'timeline_changed',
  'template_applied',
  'webhook',
]);

export const VariableScopeSchema = z.enum([
  'project',
  'scene',
  'template',
  'environment',
  'execution',
]);

export const ExecutionStatusSchema = z.enum([
  'idle',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
]);

export const WorkflowVariableSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  value: z.any(),
  scope: VariableScopeSchema,
});

export const WorkflowTriggerSchema = z.object({
  type: TriggerTypeSchema,
  config: z.record(z.any()).optional(),
});

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: WorkflowStepTypeSchema,
  config: z.record(z.any()),
  nextStepId: z.string().optional(),
  collapsed: z.boolean().optional(),
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: WorkflowTriggerSchema,
  steps: z.array(WorkflowStepSchema),
  variables: z.array(WorkflowVariableSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WorkflowResultSchema = z.object({
  stepId: z.string(),
  status: z.enum(['success', 'failed']),
  output: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string(),
});

export const WorkflowContextSchema = z.object({
  variables: z.record(z.any()),
  projectId: z.string().optional(),
  sceneId: z.string().optional(),
  templateId: z.string().optional(),
  env: z.record(z.string()),
});

export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: ExecutionStatusSchema,
  currentStepId: z.string().optional(),
  context: WorkflowContextSchema,
  history: z.array(WorkflowResultSchema),
  progress: z.number().min(0).max(100),
  startedAt: z.string(),
  endedAt: z.string().optional(),
});

export const WorkflowTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  workflow: WorkflowSchema.omit({ id: true }),
  category: z.string().optional(),
});
