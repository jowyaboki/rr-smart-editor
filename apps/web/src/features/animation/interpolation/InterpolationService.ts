import { Keyframe, EasingType } from '@ai-video-editor/shared';

export const InterpolationService = {
  interpolate(t: number, startValue: number, endValue: number, easing: EasingType): number {
    const factor = this.getEasingFactor(t, easing);
    return startValue + (endValue - startValue) * factor;
  },

  getEasingFactor(t: number, easing: EasingType): number {
    switch (easing) {
      case 'easeIn': return t * t;
      case 'easeOut': return t * (2 - t);
      case 'easeInOut': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'step': return t < 1 ? 0 : 1;
      case 'linear':
      default: return t;
    }
  }
};
