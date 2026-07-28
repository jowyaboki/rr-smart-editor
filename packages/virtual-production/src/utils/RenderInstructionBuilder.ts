import { VirtualStudio, RenderInstruction, IRenderInstructionBuilder } from '../types';

export class RenderInstructionBuilder implements IRenderInstructionBuilder {
  /**
   * Compiles the dynamic, active configuration of a VirtualStudio into a single, immutable,
   * rendering instruction block consumed by standard Render Pipelines.
   */
  public build(studio: VirtualStudio): RenderInstruction {
    const timestamp = Date.now();
    const activeSetId = studio.activeVirtualSetId;
    const activeSet = activeSetId ? (studio.virtualSets[activeSetId] as any) : undefined;

    // 1. Resolve Active Camera
    const activeCamId = activeSet ? activeSet.activeCameraId : studio.activeVirtualSetId || Object.keys(studio.cameras)[0];
    const camera = (studio.cameras[activeCamId] as any) || {
      type: 'perspective',
      transform: { position: [0, 1.6, 5], rotation: [0, 0, 0], scale: [1, 1, 1], anchorPoint: [0, 0], opacity: 1.0 },
      projection: 'perspective',
      fov: 60,
      focalLength: 50,
      depthOfField: { enabled: false, aperture: 2.8, focusDistance: 5.0, bladeCount: 9 },
    };

    // 2. Resolve Active Environment
    const activeEnvId = activeSet ? activeSet.activeEnvironmentId : Object.keys(studio.environments)[0];
    const environment = (studio.environments[activeEnvId] as any) || {
      type: 'hdri',
      sourceUrl: '',
      exposure: 1.0,
      blurAmount: 0.0,
      rotationY: 0.0,
      proceduralParams: {},
    };

    // 3. Resolve Active Lights
    const lights = Object.values(studio.lightRigs).map((l: any) => ({
      id: l.id,
      type: l.type,
      transform: l.transform,
      color: l.color,
      intensity: l.intensity,
      shadows: {
        enabled: l.shadows.enabled,
        bias: l.shadows.bias,
        radius: l.shadows.radius,
      },
    }));

    // 4. Resolve Active Compositing Layers
    const layers = activeSet && activeSet.layers
      ? (activeSet.layers as any[]).map((layer: any) => ({
          id: layer.id,
          sourceId: layer.sourceId,
          order: layer.order,
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          keying: layer.keying,
          transform3d: layer.transform3d,
        }))
      : [];

    return {
      studioId: studio.id,
      timestamp,
      viewportWidth: 1920, // baseline FHD, scalable dynamically at viewport runtime
      viewportHeight: 1080,
      camera: {
        type: camera.type,
        transform: camera.transform,
        projection: camera.projection as any,
        fov: camera.fov,
        focalLength: camera.focalLength,
        depthOfField: camera.depthOfField,
      },
      environment: {
        type: environment.type,
        sourceUrl: environment.sourceUrl,
        exposure: environment.exposure,
        blurAmount: environment.blurAmount,
        rotationY: environment.rotationY,
        proceduralParams: environment.proceduralParams,
      },
      lights,
      layers,
    };
  }
}
