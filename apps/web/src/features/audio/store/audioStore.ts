import { create } from 'zustand';
import { AudioTrack, AudioClip, AudioEffect, AudioAutomation } from '@ai-video-editor/shared';

interface AudioState {
  tracks: AudioTrack[];
  masterVolume: number;
  selectedClipId: string | null;

  addTrack: (track: AudioTrack) => void;
  updateTrack: (id: string, updates: Partial<AudioTrack>) => void;
  removeTrack: (id: string) => void;

  addClip: (trackId: string, clip: AudioClip) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<AudioClip>) => void;
  removeClip: (trackId: string, clipId: string) => void;

  setMasterVolume: (volume: number) => void;
  setSelectedClipId: (id: string | null) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  tracks: [],
  masterVolume: 1.0,
  selectedClipId: null,

  addTrack: (track) => set((state) => ({
    tracks: [...state.tracks, track]
  })),

  updateTrack: (id, updates) => set((state) => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  removeTrack: (id) => set((state) => ({
    tracks: state.tracks.filter(t => t.id !== id)
  })),

  addClip: (trackId, clip) => set((state) => ({
    tracks: state.tracks.map(t =>
      t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
    )
  })),

  updateClip: (trackId, clipId, updates) => set((state) => ({
    tracks: state.tracks.map(t =>
      t.id === trackId ? {
        ...t,
        clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
      } : t
    )
  })),

  removeClip: (trackId, clipId) => set((state) => ({
    tracks: state.tracks.map(t =>
      t.id === trackId ? {
        ...t,
        clips: t.clips.filter(c => c.id !== clipId)
      } : t
    )
  })),

  setMasterVolume: (masterVolume) => set({ masterVolume }),
  setSelectedClipId: (id) => set({ selectedClipId: id })
}));
