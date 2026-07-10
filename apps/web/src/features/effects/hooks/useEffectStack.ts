import { useEffectStore } from '../store/effectStore';
import { EffectEngine } from '../engine/EffectEngine';

export const useEffectStack = (clipId: string) => {
  const store = useEffectStore();
  const effects = store.clipEffects[clipId] || [];

  const getActiveStyles = (frame: number) => {
    return EffectEngine.evaluateStack(effects, frame);
  };

  return {
    effects,
    getActiveStyles,
    addEffect: (effectId: string) => {
        // Logic handled in component for now
    },
    updateInstance: store.updateEffectInstance,
    removeInstance: store.removeEffectFromClip
  };
};
