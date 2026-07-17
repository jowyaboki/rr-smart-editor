import { GraphEngine, DependencyResolver, InvalidationService, SnapshotService, GraphSerializer } from '@ai-video-editor/project-graph';
import { GraphValidationRegistry, GraphValidator } from '../validation';

export const webGraphEngine = new GraphEngine('web-master-graph', 'Smart Editor Main Graph');

export {
  DependencyResolver,
  InvalidationService,
  SnapshotService,
  GraphSerializer,
};

export class ProjectGraphPluginRegistry {
  private static registeredNodeTypes = new Set<string>();
  private static registeredEdgeTypes = new Set<string>();

  /**
   * Plugins can register custom node types.
   */
  public static registerNodeType(type: string): void {
    this.registeredNodeTypes.add(type);
  }

  /**
   * Plugins can register custom edge types.
   */
  public static registerEdgeType(type: string): void {
    this.registeredEdgeTypes.add(type);
  }

  /**
   * Plugins can register custom validators.
   */
  public static registerValidator(validator: GraphValidator): void {
    GraphValidationRegistry.registerValidator(validator);
  }

  public static getRegisteredNodeTypes(): string[] {
    return Array.from(this.registeredNodeTypes);
  }

  public static getRegisteredEdgeTypes(): string[] {
    return Array.from(this.registeredEdgeTypes);
  }
}
