import { CompositionLayer, Transform3D } from '../types';

export class LayerService {
  /**
   * Computes the absolute, hierarchical global transform of a nested layer
   */
  public getGlobalTransform(layer: CompositionLayer, allLayers: CompositionLayer[]): Transform3D {
    if (!layer.parentId) {
      return layer.transform;
    }

    const parent = allLayers.find(l => l.id === layer.parentId);
    if (!parent) {
      return layer.transform;
    }

    const parentGlobal = this.getGlobalTransform(parent, allLayers);

    // Compound position, scale and rotation
    return {
      position: [
        parentGlobal.position[0] + layer.transform.position[0],
        parentGlobal.position[1] + layer.transform.position[1],
        parentGlobal.position[2] + layer.transform.position[2],
      ],
      rotation: [
        parentGlobal.rotation[0] + layer.transform.rotation[0],
        parentGlobal.rotation[1] + layer.transform.rotation[1],
        parentGlobal.rotation[2] + layer.transform.rotation[2],
      ],
      scale: [
        parentGlobal.scale[0] * layer.transform.scale[0],
        parentGlobal.scale[1] * layer.transform.scale[1],
        parentGlobal.scale[2] * layer.transform.scale[2],
      ],
      anchorPoint: [
        parentGlobal.anchorPoint[0] + layer.transform.anchorPoint[0],
        parentGlobal.anchorPoint[1] + layer.transform.anchorPoint[1],
      ],
      opacity: parentGlobal.opacity * layer.transform.opacity,
    };
  }
}
