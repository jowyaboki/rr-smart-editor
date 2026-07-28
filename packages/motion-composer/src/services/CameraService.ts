import { CameraLayer, CompositionLayer } from '../types';

export class CameraService {
  /**
   * Projects a 3D layer position onto a 2D camera viewport utilizing perspective focal length
   */
  public project3DTo2D(
    layer: CompositionLayer,
    camera: CameraLayer,
    viewportWidth: number,
    viewportHeight: number,
  ): [number, number] {
    const dx = layer.transform.position[0] - camera.transform.position[0];
    const dy = layer.transform.position[1] - camera.transform.position[1];
    const dz = layer.transform.position[2] - camera.transform.position[2];

    if (camera.projection === 'orthographic') {
      return [viewportWidth / 2 + dx, viewportHeight / 2 + dy];
    }

    // Perspective projection using Thales' ratio: focal / (focal + z)
    const focalLength = camera.focalLengthMm * 10; // scale factor
    const projectionFactor = focalLength / (focalLength + dz);

    return [viewportWidth / 2 + dx * projectionFactor, viewportHeight / 2 + dy * projectionFactor];
  }
}
