import { create } from 'zustand';
import { AudioProject, AudioTrack, AudioBus, UIMixerState } from '../types';
import { globalAudioEngine2 } from '@ai-video-editor/audio-engine';

interface AudioState {
  project: AudioProject | null;
  mixerState: UIMixerState;
  activeLoudnessLUFS: number;
  clippingAlarm: boolean;

  // Actions
  setProject: (project: AudioProject) => void;
  updateMixerState: (mixer: Partial<UIMixerState>) => void;
  setLoudness: (lufs: number) => void;
  setClippingAlarm: (alarm: boolean) => void;

  // Non-destructive mutations matching transaction boundaries
  updateTrackFader: (trackId: string, gainDb: number) => void;
  updateTrackPan: (trackId: string, pan: number) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  addTrack: (track: AudioTrack) => void;
  addBus: (bus: AudioBus) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  project: null,
  mixerState: {
    showMeters: true,
    selectedTrackId: null,
    meterRefreshRateHz: 30,
  },
  activeLoudnessLUFS: -23.0,
  clippingAlarm: false,

  setProject: (project) => set({ project }),

  updateMixerState: (mixer) =>
    set((state) => ({
      mixerState: { ...state.mixerState, ...mixer },
    })),

  setLoudness: (activeLoudnessLUFS) => set({ activeLoudnessLUFS }),
  setClippingAlarm: (clippingAlarm) => set({ clippingAlarm }),

  updateTrackFader: (trackId, gainDb) =>
    set((state) => {
      if (!state.project || !state.project.tracks[trackId]) return {};
      const updatedTrack = {
        ...state.project.tracks[trackId],
        mixer: {
          ...state.project.tracks[trackId].mixer,
          faderGainDb: gainDb,
        },
      };
      const updatedProject = {
        ...state.project,
        tracks: {
          ...state.project.tracks,
          [trackId]: updatedTrack,
        },
      };
      globalAudioEngine2.publish('TrackVolumeChanged', { trackId, gainDb });
      return { project: updatedProject };
    }),

  updateTrackPan: (trackId, pan) =>
    set((state) => {
      if (!state.project || !state.project.tracks[trackId]) return {};
      const updatedTrack = {
        ...state.project.tracks[trackId],
        mixer: {
          ...state.project.tracks[trackId].mixer,
          pan,
        },
      };
      const updatedProject = {
        ...state.project,
        tracks: {
          ...state.project.tracks,
          [trackId]: updatedTrack,
        },
      };
      globalAudioEngine2.publish('TrackPanChanged', { trackId, pan });
      return { project: updatedProject };
    }),

  toggleTrackMute: (trackId) =>
    set((state) => {
      if (!state.project || !state.project.tracks[trackId]) return {};
      const updatedTrack = {
        ...state.project.tracks[trackId],
        mixer: {
          ...state.project.tracks[trackId].mixer,
          mute: !state.project.tracks[trackId].mixer.mute,
        },
      };
      const updatedProject = {
        ...state.project,
        tracks: {
          ...state.project.tracks,
          [trackId]: updatedTrack,
        },
      };
      return { project: updatedProject };
    }),

  toggleTrackSolo: (trackId) =>
    set((state) => {
      if (!state.project || !state.project.tracks[trackId]) return {};
      const updatedTrack = {
        ...state.project.tracks[trackId],
        mixer: {
          ...state.project.tracks[trackId].mixer,
          solo: !state.project.tracks[trackId].mixer.solo,
        },
      };
      const updatedProject = {
        ...state.project,
        tracks: {
          ...state.project.tracks,
          [trackId]: updatedTrack,
        },
      };
      return { project: updatedProject };
    }),

  addTrack: (track) =>
    set((state) => {
      if (!state.project) return {};
      const updatedProject = {
        ...state.project,
        tracks: {
          ...state.project.tracks,
          [track.id]: track,
        },
      };
      globalAudioEngine2.publish('TrackCreated', track);
      return { project: updatedProject };
    }),

  addBus: (bus) =>
    set((state) => {
      if (!state.project) return {};
      const updatedProject = {
        ...state.project,
        busses: {
          ...state.project.busses,
          [bus.id]: bus,
        },
      };
      globalAudioEngine2.publish('BusCreated', bus);
      return { project: updatedProject };
    }),
}));
