// Core Models & Types for the Visual Node-Based Compositing Engine

export type PortDirection = 'input' | 'output';

export type PortDataType =
  | 'image'
  | 'video'
  | 'audio'
  | 'number'
  | 'string'
  | 'boolean'
  | 'color'
  | 'mask'
  | 'vector'
  | 'matrix'
  | 'any';

export interface NodePort {
  id: string;
  name: string;
  direction: PortDirection;
  type: PortDataType;
  value?: any; // Static inline value when not connected
  isMultiConnect?: boolean;
}

export type NodeCategory =
  | 'media'
  | 'image'
  | 'video'
  | 'audio'
  | 'text'
  | 'color'
  | 'transform'
  | 'merge'
  | 'mask'
  | 'blur'
  | 'sharpen'
  | 'noise'
  | 'keying'
  | 'tracking'
  | 'lighting'
  | 'particles'
  | 'geometry'
  | 'camera'
  | 'ai'
  | 'math'
  | 'logic'
  | 'utility'
  | 'timeline'
  | 'rendering';

export interface Node {
  id: string;
  name: string;
  category: NodeCategory;
  type: string; // Specific node type (e.g. 'gaussian_blur', 'chroma_key', 'ai_segmentation')
  position: { x: number; y: number };
  inputs: NodePort[];
  outputs: NodePort[];
  properties: Record<string, any>;
  comment?: string;
  isBookmarked?: boolean;
  groupId?: string; // For grouping nodes inside clusters
  isDirty?: boolean;
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

export interface NodeGroup {
  id: string;
  name: string;
  description?: string;
  nodeIds: string[];
  color?: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export interface NodeGraph {
  id: string;
  name: string;
  nodes: Node[];
  connections: NodeConnection[];
  groups: NodeGroup[];
  bookmarks: Array<{ id: string; nodeId: string; label: string }>;
  version: string;
}

export interface ExecutionContext {
  currentTime: number;
  fps: number;
  width: number;
  height: number;
  cache: Map<string, any>; // Node ID + Port ID -> Cached output value
  variables: Record<string, any>;
}

export interface NodeExecution {
  id: string;
  graphId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startTimeMs: number;
  durationMs: number;
  evaluatedNodeIds: string[];
  errors: Array<{ nodeId: string; message: string }>;
}

export interface NodeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultProperties: Record<string, any>;
  inputs: Omit<NodePort, 'id'>[];
  outputs: Omit<NodePort, 'id'>[];
}

export interface NodePreset {
  id: string;
  name: string;
  nodeType: string;
  properties: Record<string, any>;
}

export interface GraphSnapshot {
  id: string;
  graph: NodeGraph;
  timestamp: string;
  description: string;
}

// Extensibility Plugin Interfaces
export interface NodeDefinitionPlugin {
  id: string;
  name: string;
  category: NodeCategory;
  type: string;
  inputs: Omit<NodePort, 'id'>[];
  outputs: Omit<NodePort, 'id'>[];
  execute: (inputs: Record<string, any>, context: ExecutionContext) => Promise<Record<string, any>>;
}

export interface PortRendererPlugin {
  id: string;
  portType: PortDataType;
  renderInputControl?: (port: NodePort, onChange: (val: any) => void) => any;
}

export interface CustomNodeExecutorPlugin {
  nodeType: string;
  execute: (node: Node, resolvedInputs: Record<string, any>, context: ExecutionContext) => Promise<Record<string, any>>;
}
