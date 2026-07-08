import { Keyframe, AnimatedProperty } from '@ai-video-editor/shared';
import { InterpolationService } from '../interpolation/InterpolationService';

export class MotionEngine {
  evaluateProperty(property: AnimatedProperty, frame: number, defaultValue: number): number {
    const { keyframes } = property;
    if (keyframes.length === 0) return defaultValue;

    const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

    // Before first keyframe
    if (frame <= sorted[0].frame) return sorted[0].value as number;

    // After last keyframe
    if (frame >= sorted[sorted.length - 1].frame) return sorted[sorted.length - 1].value as number;

    // Between keyframes
    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i + 1];
      if (frame >= start.frame && frame <= end.frame) {
        const t = (frame - start.frame) / (end.frame - start.frame);
        return InterpolationService.interpolate(t, start.value as number, end.value as number, start.easing);
      }
    }

    return defaultValue;
  }
}
