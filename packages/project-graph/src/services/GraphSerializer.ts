import { ProjectGraph, ProjectGraphSchema, GraphSnapshot, GraphSnapshotSchema } from '../types';

export class GraphSerializer {
  /**
   * Serialize a ProjectGraph to JSON string.
   */
  public static serializeGraph(graph: ProjectGraph): string {
    return JSON.stringify(graph, null, 2);
  }

  /**
   * Deserialize and validate a ProjectGraph from a JSON string.
   */
  public static deserializeGraph(jsonStr: string): ProjectGraph {
    const raw = JSON.parse(jsonStr);
    const parsed = ProjectGraphSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Failed to parse ProjectGraph JSON schema: ${parsed.error.message}`);
    }
    return parsed.data as ProjectGraph;
  }

  /**
   * Serialize a GraphSnapshot.
   */
  public static serializeSnapshot(snapshot: GraphSnapshot): string {
    return JSON.stringify(snapshot, null, 2);
  }

  /**
   * Deserialize and validate a GraphSnapshot.
   */
  public static deserializeSnapshot(jsonStr: string): GraphSnapshot {
    const raw = JSON.parse(jsonStr);
    const parsed = GraphSnapshotSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Failed to parse GraphSnapshot JSON schema: ${parsed.error.message}`);
    }
    return parsed.data as GraphSnapshot;
  }
}
