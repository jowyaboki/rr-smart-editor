import { VirtualStudio, Stage } from '../types';

export class StudioService {
  /**
   * Initializes a default VirtualStudio state container
   */
  public createStudio(id: string, name: string): VirtualStudio {
    const defaultStage: Stage = {
      id: 'default-stage',
      name: 'Default 10x10 Stage',
      dimensions: [10, 10, 5], // 10m x 10m x 5m
      gridSize: 1.0,
      originOffset: [0, 0, 0],
    };

    return {
      id,
      name,
      stage: defaultStage,
      cameraRigs: {},
      cameras: {},
      lightRigs: {},
      environments: {},
      trackingSources: {},
      calibrationProfiles: {},
      virtualSets: {},
      version: '1.0.0',
      metadata: {},
    };
  }

  /**
   * Sets up or updates physical stage constraints
   */
  public updateStage(studio: VirtualStudio, stage: Partial<Stage>): VirtualStudio {
    return {
      ...studio,
      stage: {
        ...studio.stage,
        ...stage,
      },
    };
  }

  /**
   * Snaps a 3D coordinate point to the nearest physical stage grid division
   */
  public snapToGrid(position: [number, number, number], gridSize: number): [number, number, number] {
    if (gridSize <= 0) return position;
    return [
      Math.round(position[0] / gridSize) * gridSize,
      Math.round(position[1] / gridSize) * gridSize,
      Math.round(position[2] / gridSize) * gridSize,
    ];
  }

  /**
   * Maps a ProjectGraph representation directly into the active VirtualStudio state.
   * This maintains complete backward-compatibility and transaction safety.
   */
  public resolveStudioFromGraph(graph: any): VirtualStudio {
    if (!graph || !graph.nodes) {
      return this.createStudio('fallback-studio', 'Fallback Studio');
    }

    // Attempt to locate a node of type 'scene' containing 'virtual_studio' values
    const studioNode = Object.values(graph.nodes).find(
      (n: any) => {
        const node = n as any;
        return node.type === 'scene' && node.state?.value?.stage;
      }
    ) as any;

    if (studioNode && studioNode.state?.value) {
      return studioNode.state.value as VirtualStudio;
    }

    return this.createStudio('resolved-studio', 'Project Studio');
  }
}
