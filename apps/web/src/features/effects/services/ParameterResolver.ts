import { EffectAnimation, Keyframe } from '@ai-video-editor/shared';

export const ParameterResolver = {
  resolve(animations: EffectAnimation[], parameterId: string, frame: number, defaultValue: any): any {
    const animation = animations.find(a => a.parameterId === parameterId);
    if (!animation || animation.keyframes.length === 0) return defaultValue;

    const keyframes = [...animation.keyframes].sort((a, b) => a.frame - b.frame);

    // Before first keyframe
    if (frame <= keyframes[0].frame) return keyframes[0].value;

    // After last keyframe
    if (frame >= keyframes[keyframes.length - 1].frame) return keyframes[keyframes.length - 1].value;

    // Between keyframes (linear interpolation)
    for (let i = 0; i < keyframes.length - 1; i++) {
      const start = keyframes[i];
      const end = keyframes[i+1];

      if (frame >= start.frame && frame <= end.frame) {
        if (typeof start.value === 'number' && typeof end.value === 'number') {
          const t = (frame - start.frame) / (end.frame - start.frame);
          return start.value + (end.value - start.value) * t;
        }
        return start.value;
      }
    }

    return defaultValue;
  }
};
