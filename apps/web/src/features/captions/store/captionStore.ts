import { create } from 'zustand';
import { CaptionTrack, CaptionSegment, CaptionWord, CaptionPreset } from '@ai-video-editor/shared';

interface CaptionState {
  tracks: CaptionTrack[];
  activeTrackId: string | null;
  selectedSegmentId: string | null;
  presets: CaptionPreset[];

  addTrack: (track: CaptionTrack) => void;
  updateTrack: (id: string, updates: Partial<CaptionTrack>) => void;
  removeTrack: (id: string) => void;
  setActiveTrack: (id: string | null) => void;

  updateSegment: (trackId: string, segmentId: string, updates: Partial<CaptionSegment>) => void;
  updateWord: (trackId: string, segmentId: string, wordId: string, updates: Partial<CaptionWord>) => void;
  setSelectedSegment: (id: string | null) => void;
  setPresets: (presets: CaptionPreset[]) => void;
}

export const useCaptionStore = create<CaptionState>((set) => ({
  tracks: [],
  activeTrackId: null,
  selectedSegmentId: null,
  presets: [],

  addTrack: (track) => set((state) => ({
    tracks: [...state.tracks, track],
    activeTrackId: state.activeTrackId || track.id
  })),

  updateTrack: (id, updates) => set((state) => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  removeTrack: (id) => set((state) => ({
    tracks: state.tracks.filter(t => t.id !== id),
    activeTrackId: state.activeTrackId === id ? null : state.activeTrackId
  })),

  setActiveTrack: (id) => set({ activeTrackId: id }),

  updateSegment: (trackId, segmentId, updates) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? {
      ...t,
      transcript: {
        ...t.transcript,
        segments: t.transcript.segments.map(s => s.id === segmentId ? { ...s, ...updates } : s)
      }
    } : t)
  })),

  updateWord: (trackId, segmentId, wordId, updates) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? {
      ...t,
      transcript: {
        ...t.transcript,
        segments: t.transcript.segments.map(s => s.id === segmentId ? {
          ...s,
          words: s.words.map(w => w.id === wordId ? { ...w, ...updates } : w)
        } : s)
      }
    } : t)
  })),

  setSelectedSegment: (id) => set({ selectedSegmentId: id }),

  setPresets: (presets) => set({ presets })
}));
