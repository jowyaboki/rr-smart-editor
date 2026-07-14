import { create } from 'zustand';
import { temporal } from 'zundo';
import { Keyframe, AnimatedProperty, AnimationTrack, EasingType } from '@ai-video-editor/shared';

interface AnimationState {
  tracks: AnimationTrack[];
  addKeyframe: (clipId: string, property: string, frame: number, value: number | string) => void;
  removeKeyframe: (clipId: string, property: string, keyframeId: string) => void;
  updateKeyframe: (clipId: string, property: string, keyframeId: string, updates: Partial<Keyframe>) => void;
}

export const useAnimationStore = create<AnimationState>()(
  temporal((set) => ({
    tracks: [],

    addKeyframe: (clipId, propertyName, frame, value) => set((state) => {
      let track = state.tracks.find(t => t.clipId === clipId);
      if (!track) {
        track = { clipId, properties: [] };
        state.tracks.push(track);
      }

      let property = track.properties.find(p => p.name === propertyName);
      if (!property) {
        property = { name: propertyName, keyframes: [] };
        track.properties.push(property);
      }

      const existingKeyframe = property.keyframes.find(k => k.frame === frame);
      if (existingKeyframe) {
        existingKeyframe.value = value;
      } else {
        property.keyframes.push({
          id: Math.random().toString(36).substr(2, 9),
          property: propertyName,
          frame,
          value,
          interpolation: 'linear',
          easing: 'linear',
          selected: false,
          locked: false
        });
      }

      return { tracks: [...state.tracks] };
    }),

    removeKeyframe: (clipId, propertyName, keyframeId) => set((state) => ({
      tracks: state.tracks.map(t => t.clipId === clipId ? {
        ...t,
        properties: t.properties.map(p => p.name === propertyName ? {
          ...p,
          keyframes: p.keyframes.filter(k => k.id !== keyframeId)
        } : p)
      } : t)
    })),

    updateKeyframe: (clipId, propertyName, keyframeId, updates) => set((state) => ({
      tracks: state.tracks.map(t => t.clipId === clipId ? {
        ...t,
        properties: t.properties.map(p => p.name === propertyName ? {
          ...p,
          keyframes: p.keyframes.map(k => k.id === keyframeId ? { ...k, ...updates } : k)
        } : p)
      } : t)
    })),
  }))
);
