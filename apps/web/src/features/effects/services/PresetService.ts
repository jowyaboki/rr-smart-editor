import { EffectPreset } from '@ai-video-editor/shared';

export const PresetService = {
  getBuiltInPresets(): EffectPreset[] {
    return [
      {
        id: 'noir',
        name: 'Film Noir',
        effects: [
          { effectId: 'grayscale', parameterValues: { amount: 1 }, enabled: true },
          { effectId: 'contrast', parameterValues: { level: 1.5 }, enabled: true }
        ]
      },
      {
        id: 'cinematic',
        name: 'Cinematic',
        effects: [
          { effectId: 'saturation', parameterValues: { level: 1.2 }, enabled: true },
          { effectId: 'contrast', parameterValues: { level: 1.1 }, enabled: true }
        ]
      }
    ];
  }
};
