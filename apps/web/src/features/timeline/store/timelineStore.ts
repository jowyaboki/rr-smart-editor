import { create } from 'zustand';
import { temporal } from 'zundo';
import { TimelineTrack, TimelineClip, TrackType } from '../types';
import { MediaAsset } from '@/features/media/types';

interface TimelineStore {
  tracks: TimelineTrack[];
  selectedClipIds: string[];
  selectedTrackId: string | null;
  playheadFrame: number;
  zoom: number;
  scrollX: number;
  scrollY: number;
  snapEnabled: boolean;

  createTrack: (name: string, type: TrackType) => void;
  deleteTrack: (id: string) => void;
  renameTrack: (id: string, name: string) => void;
  createClip: (trackId: string, asset: MediaAsset, startFrame: number) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  deleteClip: (clipId: string) => void;
  toggleClipExpansion: (clipId: string) => void;
  selectClip: (clipId: string, multi?: boolean) => void;
  clearSelection: () => void;
  setPlayhead: (frame: number) => void;
  setZoom: (zoom: number) => void;
  setScroll: (x: number, y: number) => void;
  toggleSnap: () => void;
}

export const useTimelineStore = create<TimelineStore>()(
  temporal((set) => ({
    tracks: [
      { id: 'v1', name: 'Video 1', type: 'video', locked: false, hidden: false, height: 60, index: 0, clips: [] },
      { id: 'a1', name: 'Audio 1', type: 'audio', locked: false, hidden: false, height: 60, index: 1, clips: [] },
    ],
    selectedClipIds: [],
    selectedTrackId: null,
    playheadFrame: 0,
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
    snapEnabled: true,

    createTrack: (name, type) => set((state) => ({
      tracks: [...state.tracks, {
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        locked: false,
        hidden: false,
        height: 60,
        index: state.tracks.length,
        clips: []
      }]
    })),

    deleteTrack: (id) => set((state) => ({
      tracks: state.tracks.filter(t => t.id !== id)
    })),

    renameTrack: (id, name) => set((state) => ({
      tracks: state.tracks.map(t => t.id === id ? { ...t, name } : t)
    })),

    createClip: (trackId, asset, startFrame) => set((state) => ({
      tracks: state.tracks.map(t => t.id === trackId ? {
        ...t,
        clips: [...t.clips, {
          id: Math.random().toString(36).substr(2, 9),
          trackId,
          assetId: asset.id,
          type: t.type,
          startFrame,
          durationInFrames: asset.duration ? Math.round(asset.duration * 30) : 150,
          offsetFrame: 0,
          layer: 0,
          label: asset.name,
          selected: false,
          locked: false,
          hidden: false,
          expanded: false,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          style: {},
          metadata: {}
        }]
      } : t)
    })),

    updateClip: (clipId, updates) => set((state) => ({
      tracks: state.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
      }))
    })),

    deleteClip: (clipId) => set((state) => ({
      tracks: state.tracks.map(t => ({
        ...t,
        clips: t.clips.filter(c => c.id !== clipId)
      }))
    })),

    toggleClipExpansion: (clipId) => set((state) => ({
      tracks: state.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => c.id === clipId ? { ...c, expanded: !c.expanded } : c)
      }))
    })),

    selectClip: (clipId, multi = false) => set((state) => ({
      selectedClipIds: multi ? [...state.selectedClipIds, clipId] : [clipId]
    })),

    clearSelection: () => set({ selectedClipIds: [] }),

    setPlayhead: (playheadFrame) => set({ playheadFrame: Math.max(0, playheadFrame) }),

    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 10)) }),

    setScroll: (scrollX, scrollY) => set({ scrollX, scrollY }),

    toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  }))
);
