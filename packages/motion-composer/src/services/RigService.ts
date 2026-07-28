import { RiggingConstraint, CompositionLayer } from '../types';

export class RigService {
  /**
   * Resolves rigging kinematics, follow path offsets, and look-at transformations
   */
  public resolveConstraints(
    layer: CompositionLayer,
    constraints: RiggingConstraint[],
    allLayers: CompositionLayer[],
  ): void {
    const layerConstraints = constraints.filter((c) => c.sourceLayerId === layer.id);

    layerConstraints.forEach((constraint) => {
      if (constraint.type === 'look_at') {
        const target = allLayers.find((l) => l.id === constraint.targetId);
        if (target) {
          // Compute look-at angle (2D planar rotation)
          const dx = target.transform.position[0] - layer.transform.position[0];
          const dy = target.transform.position[1] - layer.transform.position[1];
          const angleRad = Math.atan2(dy, dx);

          // Apply rotation constraint weighed by influence factor
          layer.transform.rotation[2] = angleRad * (180 / Math.PI) * constraint.weight;
        }
      } else if (constraint.type === 'follow_path') {
        // Simulates progression along a spline/vector path
        layer.transform.position[0] = 500 * constraint.weight;
        layer.transform.position[1] = 300 * constraint.weight;
      }
    });
  }
}
