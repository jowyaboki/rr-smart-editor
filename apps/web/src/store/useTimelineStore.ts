import { pipeline } from "@/features/pipeline/services/EventPipeline";
import { create } from 'zustand';
import { temporal } from 'zundo';

export interface Clip {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'text';
  start: number; // In frames
  duration: number; // In frames
  mediaId?: string;
  url?: string;
  trackId: string;
  content?: string; // For text clips
  style?: React.CSSProperties; // For text/image styles
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio';
  clips: Clip[];
}

interface TimelineState {
  tracks: Track[];
  playhead: number;
  zoom: number;
  snap: boolean;
  isPlaying: boolean;
  playbackRate: number;
  isLooping: boolean;
  addClip: (trackId: string, clip: Omit<Clip, 'id' | 'trackId'>) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  deleteClip: (clipId: string) => void;
  splitClip: (clipId: string, frame: number) => void;
  setPlayhead: (frame: number) => void;
  setZoom: (zoom: number) => void;
  toggleSnap: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  toggleLooping: () => void;
}

export const useTimelineStore = create<TimelineState>()(
  temporal((set) => ({
    tracks: [
      { id: 'v1', name: 'Video 1', type: 'video', clips: [] },
      { id: 'v2', name: 'Video 2', type: 'video', clips: [] },
      { id: 'a1', name: 'Audio 1', type: 'audio', clips: [] },
    ],
    playhead: 0,
    zoom: 1,
    snap: true,
    isPlaying: false,
    playbackRate: 1,
    isLooping: false,
    addClip: (trackId, clipData) =>
      set((state) => ({
        tracks: state.tracks.map((t) =>
          t.id === trackId
            ? {
                ...t,
                clips: [
                  ...t.clips,
                  { ...clipData, id: Math.random().toString(36).substr(2, 9), trackId },
                ],
              }
            : t,
        ),
      })),
    updateClip: (clipId, updates) =>
      set((state) => ({
        tracks: state.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
        })),
      })),
    deleteClip: (clipId) =>
      set((state) => ({
        tracks: state.tracks.map((t) => ({
          ...t,
          clips: t.clips.filter((c) => c.id !== clipId),
        })),
      })),
    splitClip: (clipId, frame) =>
      set((state) => ({
        tracks: state.tracks.map((t) => {
          const clipIndex = t.clips.findIndex((c) => c.id === clipId);
          if (clipIndex === -1) return t;
          const clip = t.clips[clipIndex];
          if (frame <= clip.start || frame >= clip.start + clip.duration) return t;

          const newClips = [...t.clips];
          const secondClip = {
            ...clip,
            id: Math.random().toString(36).substr(2, 9),
            start: frame,
            duration: clip.start + clip.duration - frame,
          };
          clip.duration = frame - clip.start;
          newClips.push(secondClip);
          return { ...t, clips: newClips };
        }),
      })),
    setPlayhead: (playhead) => set({ playhead }),
    setZoom: (zoom) => set({ zoom }),
    toggleSnap: () => set((state) => ({ snap: !state.snap })),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setPlaybackRate: (playbackRate) => set({ playbackRate }),
    toggleLooping: () => set((state) => ({ isLooping: !state.isLooping })),
  })),
);
