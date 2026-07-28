import { create } from 'zustand';
import { TimelineViewport, VirtualTrack, VirtualClip, TimelineMarker, VirtualKeyframe } from '../types';
import { EditToolMode, SnappingConfig, NleMarker, TrackStateOverrides } from '../tools/types';
import { TimelineIndexService, GeometryService, DirtyRegionRenderer } from '@ai-video-editor/timeline-engine';
import { NleToolService, NleSnappingService, NleGroupingService } from '../tools/services';

export const webTimelineIndex = new TimelineIndexService(500);
export const webTimelineRenderer = new DirtyRegionRenderer(1000);

interface TimelineState {
  viewport: TimelineViewport;
  tracks: VirtualTrack[];
  clips: VirtualClip[];
  markers: TimelineMarker[];
  keyframes: VirtualKeyframe[];
  selectedClipIds: string[];

  // NLE extended state
  toolMode: EditToolMode;
  snappingConfig: SnappingConfig;
  nleMarkers: NleMarker[];
  playbackSpeed: number;
  trackStates: Record<string, TrackStateOverrides>;

  // Dragging interaction state
  isDragging: boolean;
  draggedClipId: string | null;
  dragOffsetFrame: number;

  // Actions
  setViewport: (viewport: Partial<TimelineViewport>) => void;
  setTracks: (tracks: VirtualTrack[]) => void;
  setClips: (clips: VirtualClip[]) => void;
  setMarkers: (markers: TimelineMarker[]) => void;
  setKeyframes: (keyframes: VirtualKeyframe[]) => void;

  // NLE tools setters
  setToolMode: (mode: EditToolMode) => void;
  setSnappingConfig: (config: Partial<SnappingConfig>) => void;
  addNleMarker: (marker: NleMarker) => void;
  removeNleMarker: (id: string) => void;
  setPlaybackSpeed: (speed: number) => void;
  setTrackState: (trackId: string, overrides: Partial<TrackStateOverrides>) => void;

  // Interactions
  selectClips: (ids: string[]) => void;
  moveClip: (clipId: string, newStartFrame: number, newTrackId?: string) => void;
  resizeClip: (clipId: string, newDuration: number) => void;

  // NLE Clip Operations (executed through virtual tools)
  razorSplitClip: (clipId: string, splitFrame: number) => void;
  rippleEditClip: (clipId: string, deltaFrames: number, edge: 'start' | 'end') => void;
  rollEditClips: (clipAId: string, clipBId: string, deltaFrames: number) => void;
  slipEditClip: (clipId: string, deltaFrames: number) => void;
  slideEditClip: (clipId: string, deltaFrames: number, clipAId: string, clipBId: string) => void;

  // Drag state setters
  startDrag: (clipId: string, offsetFrame: number) => void;
  updateDrag: (currentFrame: number, newTrackId?: string) => void;
  endDrag: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => {
  return {
    viewport: {
      scrollLeft: 0,
      scrollTop: 0,
      width: 800,
      height: 400,
      pxPerFrame: 0.5,
    },
    tracks: [],
    clips: [],
    markers: [],
    keyframes: [],
    selectedClipIds: [],

    // Default NLE settings
    toolMode: 'select',
    snappingConfig: {
      enabled: true,
      snapToPlayhead: true,
      snapToMarkers: true,
      snapToClipEdges: true,
      snapToTransitions: false,
      snapToKeyframes: false,
      snapToAudioPeaks: false,
      snapThreshold: 8,
    },
    nleMarkers: [],
    playbackSpeed: 0,
    trackStates: {},

    isDragging: false,
    draggedClipId: null,
    dragOffsetFrame: 0,

    setViewport: (newViewport) => {
      set(state => ({ viewport: { ...state.viewport, ...newViewport } }));
    },

    setTracks: (tracks) => {
      set({ tracks });
      webTimelineIndex.rebuildIndex(tracks, get().clips, get().markers, get().keyframes);
    },

    setClips: (clips) => {
      set({ clips });
      webTimelineIndex.rebuildIndex(get().tracks, clips, get().markers, get().keyframes);
    },

    setMarkers: (markers) => {
      set({ markers });
      webTimelineIndex.rebuildIndex(get().tracks, get().clips, markers, get().keyframes);
    },

    setKeyframes: (keyframes) => {
      set({ keyframes });
      webTimelineIndex.rebuildIndex(get().tracks, get().clips, get().markers, keyframes);
    },

    setToolMode: (toolMode) => set({ toolMode }),

    setSnappingConfig: (config) => {
      set(state => ({ snappingConfig: { ...state.snappingConfig, ...config } }));
    },

    addNleMarker: (marker) => {
      set(state => ({ nleMarkers: [...state.nleMarkers, marker] }));
    },

    removeNleMarker: (id) => {
      set(state => ({ nleMarkers: state.nleMarkers.filter(m => m.id !== id) }));
    },

    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

    setTrackState: (trackId, overrides) => {
      set(state => {
        const current = state.trackStates[trackId] || { isLocked: false, isMuted: false, isSolo: false, isHidden: false };
        return {
          trackStates: {
            ...state.trackStates,
            [trackId]: { ...current, ...overrides },
          },
        };
      });
    },

    selectClips: (ids) => {
      const expanded = NleGroupingService.expandSelection(ids);
      set({ selectedClipIds: expanded });
      webTimelineIndex.setSelections(expanded);
    },

    moveClip: (clipId, newStartFrame, newTrackId) => {
      set(state => {
        const target = state.clips.find(c => c.id === clipId);
        if (!target) return {};

        const delta = newStartFrame - target.startFrame;

        // Apply grouped selections movement together!
        const clips = NleGroupingService.shiftClipsTogether(state.selectedClipIds, delta, state.clips);

        // Inform index and mark dirty
        webTimelineIndex.deindexClip(clipId);
        const updatedClip = clips.find(c => c.id === clipId);
        if (updatedClip) {
          webTimelineIndex.indexClip(updatedClip);
          webTimelineRenderer.markClipDirty(clipId);
        }

        return { clips };
      });
    },

    resizeClip: (clipId, newDuration) => {
      set(state => {
        const clips = state.clips.map(clip => {
          if (clip.id === clipId) {
            return {
              ...clip,
              duration: Math.max(1, newDuration),
            };
          }
          return clip;
        });

        webTimelineIndex.deindexClip(clipId);
        const updatedClip = clips.find(c => c.id === clipId);
        if (updatedClip) {
          webTimelineIndex.indexClip(updatedClip);
          webTimelineRenderer.markClipDirty(clipId);
        }

        return { clips };
      });
    },

    razorSplitClip: (clipId, splitFrame) => {
      set(state => {
        const target = state.clips.find(c => c.id === clipId);
        if (!target) return {};

        try {
          const { left, right } = NleToolService.splitClip(target, splitFrame);
          const filtered = state.clips.filter(c => c.id !== clipId);
          const clips = [...filtered, left, right];

          webTimelineIndex.deindexClip(clipId);
          webTimelineIndex.indexClip(left);
          webTimelineIndex.indexClip(right);

          return { clips, selectedClipIds: [left.id] };
        } catch (e) {
          console.error(e);
          return {};
        }
      });
    },

    rippleEditClip: (clipId, deltaFrames, edge) => {
      set(state => {
        const clips = NleToolService.applyRippleEdit(clipId, deltaFrames, edge, state.clips);

        webTimelineIndex.deindexClip(clipId);
        const updated = clips.find(c => c.id === clipId);
        if (updated) {
          webTimelineIndex.indexClip(updated);
          webTimelineRenderer.markClipDirty(clipId);
        }

        return { clips };
      });
    },

    rollEditClips: (clipAId, clipBId, deltaFrames) => {
      set(state => {
        const clips = NleToolService.applyRollEdit(clipAId, clipBId, deltaFrames, state.clips);
        return { clips };
      });
    },

    slipEditClip: (clipId, deltaFrames) => {
      set(state => {
        const clips = NleToolService.applySlipEdit(clipId, deltaFrames, state.clips);
        return { clips };
      });
    },

    slideEditClip: (clipId, deltaFrames, clipAId, clipBId) => {
      set(state => {
        const clips = NleToolService.applySlideEdit(clipId, deltaFrames, clipAId, clipBId, state.clips);
        return { clips };
      });
    },

    startDrag: (clipId, offsetFrame) => {
      webTimelineRenderer.setInteracting(true);
      set({
        isDragging: true,
        draggedClipId: clipId,
        dragOffsetFrame: offsetFrame,
      });
    },

    updateDrag: (currentFrame, newTrackId) => {
      const { draggedClipId, dragOffsetFrame, clips, snappingConfig, markers, keyframes } = get();
      if (!draggedClipId) return;

      const clip = clips.find(c => c.id === draggedClipId);
      if (!clip) return;

      let targetFrame = Math.max(0, currentFrame - dragOffsetFrame);

      // Perform NLE Snapping
      targetFrame = NleSnappingService.calculateSnapFrame(
        targetFrame,
        snappingConfig,
        clips.filter(c => c.id !== draggedClipId),
        markers,
        keyframes
      );

      get().moveClip(draggedClipId, targetFrame, newTrackId);
    },

    endDrag: () => {
      webTimelineRenderer.setInteracting(false);
      set({
        isDragging: false,
        draggedClipId: null,
        dragOffsetFrame: 0,
      });
    },
  };
});
