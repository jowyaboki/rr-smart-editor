import { TimelineViewport, VisibleRegion, VirtualTrack, VirtualClip, VirtualKeyframe, TimelineMarker } from '../types';
import { TimelineIndexService } from '../indexing/TimelineIndexService';

export class TimelineVirtualizer {
  /**
   * Translates pixel scroll coordinates and dimensions into visible frames and track indexes,
   * applying adaptive overscan margins.
   */
  public static calculateVisibleRegion(
    viewport: TimelineViewport,
    totalTracks: VirtualTrack[],
    overscanFrames: number = 60, // overscan margin in frames (e.g. 2 seconds at 30 FPS)
    overscanTracks: number = 1   // overscan margin in track count
  ): VisibleRegion {
    const { scrollLeft, scrollTop, width, height, pxPerFrame } = viewport;

    // 1. Calculate horizontal range (frames)
    const rawStartFrame = Math.floor(scrollLeft / pxPerFrame);
    const rawEndFrame = Math.ceil((scrollLeft + width) / pxPerFrame);

    const startFrame = Math.max(0, rawStartFrame - overscanFrames);
    const endFrame = rawEndFrame + overscanFrames;

    // 2. Calculate vertical range (track indices)
    let startTrackIdx = -1;
    let endTrackIdx = -1;

    for (let i = 0; i < totalTracks.length; i++) {
      const track = totalTracks[i];
      const trackBottom = track.yOffset + track.height;
      const isVisible = trackBottom >= scrollTop && track.yOffset <= scrollTop + height;

      if (isVisible) {
        if (startTrackIdx === -1) {
          startTrackIdx = i;
        }
        endTrackIdx = i;
      }
    }

    // Default fallbacks if none are visible or tracks are empty
    if (startTrackIdx === -1) startTrackIdx = 0;
    if (endTrackIdx === -1) endTrackIdx = Math.max(0, totalTracks.length - 1);

    // Apply vertical overscan
    startTrackIdx = Math.max(0, startTrackIdx - overscanTracks);
    endTrackIdx = Math.min(totalTracks.length - 1, endTrackIdx + overscanTracks);

    return {
      startFrame,
      endFrame,
      startTrackIdx,
      endTrackIdx,
    };
  }

  /**
   * Cull clips to return only those intersecting the visible region.
   */
  public static cullClips(
    visibleRegion: VisibleRegion,
    totalTracks: VirtualTrack[],
    indexService: TimelineIndexService
  ): VirtualClip[] {
    const rawClips = indexService.queryClips(visibleRegion.startFrame, visibleRegion.endFrame);

    // Filter down to only clips located in visible track indexes (vertical culling)
    const visibleTrackIds = new Set<string>();
    for (let i = visibleRegion.startTrackIdx; i <= visibleRegion.endTrackIdx; i++) {
      if (totalTracks[i]) {
        visibleTrackIds.add(totalTracks[i].id);
      }
    }

    return rawClips.filter(clip => visibleTrackIds.has(clip.trackId));
  }

  /**
   * Cull keyframes to return only those visible.
   * Leverages nested virtualization (only query if the keyframe falls inside the horizontal visible frame range).
   */
  public static cullKeyframes(
    visibleRegion: VisibleRegion,
    indexService: TimelineIndexService
  ): VirtualKeyframe[] {
    return indexService.queryKeyframes(visibleRegion.startFrame, visibleRegion.endFrame);
  }

  /**
   * Cull markers to return only those visible.
   */
  public static cullMarkers(
    visibleRegion: VisibleRegion,
    indexService: TimelineIndexService
  ): TimelineMarker[] {
    return indexService.queryMarkers(visibleRegion.startFrame, visibleRegion.endFrame);
  }
}
