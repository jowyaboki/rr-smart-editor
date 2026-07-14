import { TransitionInstance, TransitionPreset } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const TransitionService = {
  createFromPreset(preset: TransitionPreset, trackId: string, atFrame: number): TransitionInstance {
    return {
      id: uuidv4(),
      transitionId: preset.id,
      trackId,
      atFrame
    };
  }
};
