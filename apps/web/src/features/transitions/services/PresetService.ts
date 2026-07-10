import { TransitionPreset } from '@ai-video-editor/shared';

export const PresetService = {
  getBuiltInPresets(): TransitionPreset[] {
    return [
      { id: 'fade', name: 'Fade', type: 'fade', defaultSettings: { durationFrames: 30 } },
      { id: 'crossfade', name: 'Cross Dissolve', type: 'crossfade', defaultSettings: { durationFrames: 30 } },
      { id: 'dip-to-black', name: 'Dip to Black', type: 'dip-to-black', defaultSettings: { durationFrames: 30, color: '#000000' } },
      { id: 'slide-left', name: 'Slide Left', type: 'slide', defaultSettings: { durationFrames: 20, direction: 'left' } },
      { id: 'slide-right', name: 'Slide Right', type: 'slide', defaultSettings: { durationFrames: 20, direction: 'right' } },
      { id: 'slide-up', name: 'Slide Up', type: 'slide', defaultSettings: { durationFrames: 20, direction: 'up' } },
      { id: 'slide-down', name: 'Slide Down', type: 'slide', defaultSettings: { durationFrames: 20, direction: 'down' } },
      { id: 'push', name: 'Push', type: 'push', defaultSettings: { durationFrames: 20, direction: 'right' } },
      { id: 'zoom', name: 'Zoom', type: 'zoom', defaultSettings: { durationFrames: 25, direction: 'in' } },
      { id: 'scale', name: 'Scale', type: 'scale', defaultSettings: { durationFrames: 25 } },
      { id: 'blur', name: 'Blur', type: 'blur', defaultSettings: { durationFrames: 30, intensity: 10 } },
      { id: 'wipe', name: 'Wipe', type: 'wipe', defaultSettings: { durationFrames: 30, direction: 'right' } },
      { id: 'circle-reveal', name: 'Circle Reveal', type: 'circle-reveal', defaultSettings: { durationFrames: 45 } },
      { id: 'linear-wipe', name: 'Linear Wipe', type: 'linear-wipe', defaultSettings: { durationFrames: 30, direction: 'right' } }
    ];
  }
};
