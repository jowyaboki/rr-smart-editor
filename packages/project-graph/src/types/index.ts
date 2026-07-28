import { z } from 'zod';

export type NodeType =
  | 'project'
  | 'scene'
  | 'track'
  | 'clip'
  | 'asset'
  | 'variable'
  | 'expression'
  | 'workflow'
  | 'node_graph'
  | 'template'
  | 'component'
  | 'brand_kit'
  | 'data_source'
  | 'ai_task'
  | 'render_job'
  | 'plugin_resource';

export const NodeTypeSchema = z.enum([
  'project',
  'scene',
  'track',
  'clip',
  'asset',
  'variable',
  'expression',
  'workflow',
  'node_graph',
  'template',
  'component',
  'brand_kit',
  'data_source',
  'ai_task',
  'render_job',
  'plugin_resource',
]);

export type DependencyType =
  | 'uses'
  | 'produces'
  | 'depends_on'
  | 'references'
  | 'generates'
  | 'overrides';

export const DependencyTypeSchema = z.enum([
  'uses',
  'produces',
  'depends_on',
  'references',
  'generates',
  'overrides',
]);

export interface NodeState {
  value: any;
  computedValue?: any;
  isDirty: boolean;
  version: number;
}

export const NodeStateSchema = z.object({
  value: z.any(),
  computedValue: z.any().optional(),
  isDirty: z.boolean().default(false),
  version: z.number().default(1),
});

export interface NodeMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  tags?: string[];
  pluginId?: string;
  [key: string]: any;
}

export const NodeMetadataSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.string().default('1.0.0'),
  tags: z.array(z.string()).optional(),
  pluginId: z.string().optional(),
}).catchall(z.any());

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  state: NodeState;
  metadata: NodeMetadata;
}

export const GraphNodeSchema = z.object({
  id: z.string().min(1),
  type: NodeTypeSchema,
  name: z.string(),
  state: NodeStateSchema,
  metadata: NodeMetadataSchema,
});

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: DependencyType;
  metadata?: Record<string, any>;
}

export const GraphEdgeSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  type: DependencyTypeSchema,
  metadata: z.record(z.any()).optional(),
});

export interface Dependency {
  nodeId: string;
  type: DependencyType;
  path?: string; // property or variable path
}

export const DependencySchema = z.object({
  nodeId: z.string(),
  type: DependencyTypeSchema,
  path: z.string().optional(),
});

export interface Reference {
  sourceNodeId: string;
  targetNodeId: string;
  expression?: string;
  type: DependencyType;
}

export const ReferenceSchema = z.object({
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  expression: z.string().optional(),
  type: DependencyTypeSchema,
});

export interface ProjectGraph {
  id: string;
  name: string;
  version: number;
  nodes: Record<string, GraphNode>;
  edges: Record<string, GraphEdge>;
  metadata?: Record<string, any>;
}

export const ProjectGraphSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  version: z.number().default(1),
  nodes: z.record(GraphNodeSchema),
  edges: z.record(GraphEdgeSchema),
  metadata: z.record(z.any()).optional(),
});

export interface GraphSnapshot {
  id: string;
  graphId: string;
  timestamp: string;
  version: number;
  graph: ProjectGraph;
  description?: string;
}

export const GraphSnapshotSchema = z.object({
  id: z.string().min(1),
  graphId: z.string().min(1),
  timestamp: z.string(),
  version: z.number(),
  graph: ProjectGraphSchema,
  description: z.string().optional(),
});

export interface GraphDiff {
  addedNodes: GraphNode[];
  removedNodes: string[];
  updatedNodes: { nodeId: string; before: GraphNode; after: GraphNode }[];
  addedEdges: GraphEdge[];
  removedEdges: string[];
}
