import { AudioEffect } from '@ai-video-editor/shared';

export const AudioEffectRegistry = {
  getDefinitions() {
    return [
      { id: 'fade-in', name: 'Fade In', parameters: [{ id: 'duration', type: 'number', defaultValue: 30 }] },
      { id: 'fade-out', name: 'Fade Out', parameters: [{ id: 'duration', type: 'number', defaultValue: 30 }] },
      { id: 'eq', name: 'Equalizer', parameters: [{ id: 'low', type: 'number', defaultValue: 0 }, { id: 'mid', type: 'number', defaultValue: 0 }, { id: 'high', type: 'number', defaultValue: 0 }] }
    ];
  }
};
