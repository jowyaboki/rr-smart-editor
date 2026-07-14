import { useTransitionStore } from '../store/transitionStore';
import { TransitionService } from '../services/TransitionService';
import { TransitionPreset } from '@ai-video-editor/shared';

export const useTransitions = () => {
  const store = useTransitionStore();

  const addTransition = (preset: TransitionPreset, trackId: string, atFrame: number) => {
    const instance = TransitionService.createFromPreset(preset, trackId, atFrame);
    store.addInstance(instance);
    return instance;
  };

  return {
    instances: store.instances,
    presets: store.presets,
    selectedId: store.selectedInstanceId,
    addTransition,
    removeTransition: store.removeInstance,
    selectTransition: store.setSelectedInstanceId
  };
};
