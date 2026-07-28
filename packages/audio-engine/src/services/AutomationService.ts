import { AutomationCurve, AutomationPoint } from '../types';

export class AutomationService {
  /**
   * Resolves the interpolated parameter value at a target timeline frame position
   */
  public evaluateCurve(curve: AutomationCurve, targetFrame: number): number {
    const points = curve.points;
    if (points.length === 0) return 1.0; // default gain mapping
    if (points.length === 1) return points[0][1];

    // Out of bounds checks
    if (targetFrame <= points[0][0]) return points[0][1];
    if (targetFrame >= points[points.length - 1][0]) return points[points.length - 1][1];

    // Find bounding keyframe segments
    let i = 0;
    while (i < points.length - 1 && points[i + 1][0] < targetFrame) {
      i++;
    }

    const start = points[i];
    const end = points[i + 1];

    // Interpolate
    const t = (targetFrame - start[0]) / (end[0] - start[0] || 1.0);

    if (curve.interpolation === 'hold') {
      return start[1];
    }

    if (curve.interpolation === 'bezier') {
      // Fast quadratic ease-in-out mapping
      const easedT = t < 0.5 ? 2.0 * t * t : 1.0 - Math.pow(-2.0 * t + 2.0, 2.0) / 2.0;
      return start[1] + (end[1] - start[1]) * easedT;
    }

    // Default Linear Interpolation
    return start[1] + (end[1] - start[1]) * t;
  }
}
