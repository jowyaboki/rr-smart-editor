import { TransitionInstance, TransitionSettings } from '@ai-video-editor/shared';
import { useTransitionStore } from '../store/transitionStore';

export const TransitionEngine = {
  evaluate(instance: TransitionInstance, frame: number): number {
    const { presets } = useTransitionStore.getState();
    const preset = presets.find(p => p.id === instance.transitionId);
    if (!preset) return 0;

    const relativeFrame = frame - instance.atFrame;
    const duration = preset.defaultSettings.durationFrames;

    if (relativeFrame < 0 || relativeFrame > duration) return 0;

    // Progress from 0 to 1
    return relativeFrame / duration;
  },

  buildAnimationProps(instance: TransitionInstance): any {
    const { presets } = useTransitionStore.getState();
    const preset = presets.find(p => p.id === instance.transitionId);
    if (!preset) return {};

    return {
      type: preset.type,
      duration: preset.defaultSettings.durationFrames,
      settings: preset.defaultSettings
    };
  }
};
