import { GraphEdge, DependencyType } from '../types';

export function createGraphEdge(
  id: string,
  sourceId: string,
  targetId: string,
  type: DependencyType,
  metadata?: Record<string, any>
): GraphEdge {
  return {
    id,
    sourceId,
    targetId,
    type,
    metadata,
  };
}

export const EdgeBuilders = {
  uses: (id: string, srcId: string, tgtId: string) => createGraphEdge(id, srcId, tgtId, 'uses'),
  produces: (id: string, srcId: string, tgtId: string) => createGraphEdge(id, srcId, tgtId, 'produces'),
  dependsOn: (id: string, srcId: string, tgtId: string) => createGraphEdge(id, srcId, tgtId, 'depends_on'),
  references: (id: string, srcId: string, tgtId: string) => createGraphEdge(id, srcId, tgtId, 'references'),
  generates: (id: string, srcId: string, tgtId: string) => createGraphEdge(id, srcId, tgtId, 'generates'),
  overrides: (id: string, srcId: string, tgtId: string) => createGraphEdge(id, srcId, tgtId, 'overrides'),
};
