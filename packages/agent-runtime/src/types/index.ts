import { z } from 'zod';

// ==========================================
// TOOL DEFINITIONS & CALLS
// ==========================================

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any> | Record<string, any>; // JSON Schema
  permissions: string[];
  version: string;
  executor: (args: any, context: ExecutionContext) => Promise<ToolResult>;
}

export interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
}

export const ToolCallSchema = z.object({
  id: z.string(),
  toolName: z.string(),
  arguments: z.record(z.any()),
});

export interface ToolResult {
  callId: string;
  success: boolean;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const ToolResultSchema = z.object({
  callId: z.string(),
  success: z.boolean(),
  result: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
});

// ==========================================
// AGENT & PLANNING SYSTEM
// ==========================================

export interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  allowedTools: string[];
}

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  systemPrompt: z.string(),
  allowedTools: z.array(z.string()),
});

export interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  dependencies: string[]; // IDs of tasks that must be executed first
  assignedTo?: string; // Agent ID
  result?: any;
  error?: string;
}

export const AgentTaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  dependencies: z.array(z.string()).default([]),
  assignedTo: z.string().optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export interface AgentPlan {
  id: string;
  tasks: AgentTask[];
  strategy: 'sequential' | 'parallel' | 'hierarchical';
}

export const AgentPlanSchema = z.object({
  id: z.string(),
  tasks: z.array(AgentTaskSchema),
  strategy: z.enum(['sequential', 'parallel', 'hierarchical']),
});

// ==========================================
// AGENT MEMORY & CACHES
// ==========================================

export interface AgentMemory {
  conversation: { role: 'user' | 'assistant' | 'system'; content: string; timestamp: number }[];
  project: Record<string, any>;
  workspace: Record<string, any>;
  tasks: Record<string, any>;
  shortTermCache: Map<string, any>;
}

// ==========================================
// CONTEXTS
// ==========================================

export interface ConversationContext {
  conversationId: string;
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
  metadata?: Record<string, any>;
}

export interface ExecutionContext {
  projectId: string;
  selection: {
    selectedClipIds: string[];
    selectedTrackId: string | null;
    selectedMarkerId: string | null;
  };
  timelineState: {
    playhead: number;
    zoom: number;
    duration: number;
    fps: number;
  };
  variables: Record<string, any>;
  assets: any[]; // List of assets in project
  userPreferences: Record<string, any>;
  openPanels: string[]; // IDs of panels visible in UI
  onProgress?: (progress: number, message: string) => void;
  onCancel?: () => void;
  isCancelled: boolean;
  timeout?: number;
}
