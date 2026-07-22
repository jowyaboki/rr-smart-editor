import { z } from 'zod';

export type NodeCategory =
  | 'trigger'
  | 'ai'
  | 'media'
  | 'project'
  | 'data'
  | 'logic'
  | 'publishing';

export const NodeCategorySchema = z.enum([
  'trigger',
  'ai',
  'media',
  'project',
  'data',
  'logic',
  'publishing',
]);

export interface WorkflowNode {
  id: string;
  name: string;
  category: NodeCategory;
  type: string; // e.g. 'manual', 'prompt', 'render', 'csv', 'if', 'notify'
  config: Record<string, any>;
  position: { x: number; y: number };
}

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: NodeCategorySchema,
  type: z.string(),
  config: z.record(z.any()),
  position: z.object({ x: z.number(), y: z.number() }),
});

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string;
  targetPort?: string;
}

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  sourcePort: z.string().optional(),
  targetPort: z.string().optional(),
});

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: string;
}

export const WorkflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
  version: z.string(),
});

export interface ExecutionStep {
  nodeId: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  startTime?: number;
  endTime?: number;
  output?: any;
  error?: string;
}

export interface DebuggerBreakpoint {
  nodeId: string;
  enabled: boolean;
}

export interface NodeLog {
  nodeId: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}
