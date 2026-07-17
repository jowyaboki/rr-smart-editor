import { ProjectGraph, GraphNode, GraphEdge } from '../types';

export interface GraphValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export type GraphValidator = (graph: ProjectGraph) => GraphValidationError[];

export class GraphValidationRegistry {
  private static validators: GraphValidator[] = [];

  /**
   * Register a custom validator function.
   */
  public static registerValidator(validator: GraphValidator): void {
    this.validators.push(validator);
  }

  /**
   * Run all registered validators.
   */
  public static validate(graph: ProjectGraph): GraphValidationError[] {
    const errors: GraphValidationError[] = [];

    // Core built-in validation: Check that all edges refer to existing nodes
    for (const [id, edge] of Object.entries(graph.edges)) {
      if (!graph.nodes[edge.sourceId]) {
        errors.push({
          edgeId: id,
          message: `Edge "${id}" refers to missing source node "${edge.sourceId}".`,
          severity: 'error',
        });
      }
      if (!graph.nodes[edge.targetId]) {
        errors.push({
          edgeId: id,
          message: `Edge "${id}" refers to missing target node "${edge.targetId}".`,
          severity: 'error',
        });
      }
    }

    // Run registered validators
    for (const validator of this.validators) {
      try {
        errors.push(...validator(graph));
      } catch (err: any) {
        errors.push({
          message: `Validator failed with error: ${err.message || String(err)}`,
          severity: 'warning',
        });
      }
    }

    return errors;
  }
}
