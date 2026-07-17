import { create } from 'zustand';
import { TimelineViewport, VirtualTrack, VirtualClip, TimelineMarker, VirtualKeyframe } from '../types';
import { TimelineIndexService, GeometryService, DirtyRegionRenderer } from '@ai-video-editor/timeline-engine';

export const webTimelineIndex = new TimelineIndexService(500);
export const webTimelineRenderer = new DirtyRegionRenderer(1000);

interface TimelineState {
  viewport: TimelineViewport;
  tracks: VirtualTrack[];
  clips: VirtualClip[];
  markers: TimelineMarker[];
  keyframes: VirtualKeyframe[];
  selectedClipIds: string[];

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

  // Interactions
  selectClips: (ids: string[]) => void;
  moveClip: (clipId: string, newStartFrame: number, newTrackId?: string) => void;
  resizeClip: (clipId: string, newDuration: number) => void;

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
      pxPerFrame: 0.5, // horizontal zoom level: pixels per frame
    },
    tracks: [],
    clips: [],
    markers: [],
    keyframes: [],
    selectedClipIds: [],

    isDragging: false,
    draggedClipId: null,
    dragOffsetFrame: 0,

    setViewport: (newViewport) => {
      set(state => {
        const viewport = { ...state.viewport, ...newViewport };
        return { viewport };
      });
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

    selectClips: (ids) => {
      set({ selectedClipIds: ids });
      webTimelineIndex.setSelections(ids);
    },

    moveClip: (clipId, newStartFrame, newTrackId) => {
      set(state => {
        const clips = state.clips.map(clip => {
          if (clip.id === clipId) {
            return {
              ...clip,
              startFrame: Math.max(0, newStartFrame),
              trackId: newTrackId || clip.trackId,
            };
          }
          return clip;
        });

        // Inform index and mark dirty for partial invalidation!
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

    startDrag: (clipId, offsetFrame) => {
      webTimelineRenderer.setInteracting(true);
      set({
        isDragging: true,
        draggedClipId: clipId,
        dragOffsetFrame: offsetFrame,
      });
    },

    updateDrag: (currentFrame, newTrackId) => {
      const { draggedClipId, dragOffsetFrame, clips } = get();
      if (!draggedClipId) return;

      const clip = clips.find(c => c.id === draggedClipId);
      if (!clip) return;

      // Apply drag target calculation
      let targetFrame = Math.max(0, currentFrame - dragOffsetFrame);

      // Snapping candidate calculation: snap to other clips start/end
      targetFrame = GeometryService.getSnapFrame(targetFrame, clips.filter(c => c.id !== draggedClipId), 8);

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
