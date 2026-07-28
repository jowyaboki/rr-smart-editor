import { GraphNode, NodeType } from '../types';

export function createGraphNode(
  id: string,
  type: NodeType,
  name: string,
  value: any,
  tags: string[] = []
): GraphNode {
  return {
    id,
    type,
    name,
    state: {
      value,
      isDirty: false,
      version: 1,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      tags,
    },
  };
}

export const NodeBuilders = {
  project: (id: string, name: string, value: any) => createGraphNode(id, 'project', name, value, ['root']),
  scene: (id: string, name: string, value: any) => createGraphNode(id, 'scene', name, value, ['layout']),
  track: (id: string, name: string, value: any) => createGraphNode(id, 'track', name, value, ['timeline']),
  clip: (id: string, name: string, value: any) => createGraphNode(id, 'clip', name, value, ['media']),
  asset: (id: string, name: string, value: any) => createGraphNode(id, 'asset', name, value, ['file']),
  variable: (id: string, name: string, value: any) => createGraphNode(id, 'variable', name, value, ['dynamic']),
  expression: (id: string, name: string, value: any) => createGraphNode(id, 'expression', name, value, ['eval']),
  workflow: (id: string, name: string, value: any) => createGraphNode(id, 'workflow', name, value, ['automation']),
  nodeGraph: (id: string, name: string, value: any) => createGraphNode(id, 'node_graph', name, value, ['subgraph']),
  template: (id: string, name: string, value: any) => createGraphNode(id, 'template', name, value, ['reusable']),
  component: (id: string, name: string, value: any) => createGraphNode(id, 'component', name, value, ['ui']),
  brandKit: (id: string, name: string, value: any) => createGraphNode(id, 'brand_kit', name, value, ['styles']),
  dataSource: (id: string, name: string, value: any) => createGraphNode(id, 'data_source', name, value, ['api']),
  aiTask: (id: string, name: string, value: any) => createGraphNode(id, 'ai_task', name, value, ['intelligence']),
  renderJob: (id: string, name: string, value: any) => createGraphNode(id, 'render_job', name, value, ['output']),
  pluginResource: (id: string, name: string, value: any) => createGraphNode(id, 'plugin_resource', name, value, ['extension']),
};
