import { useMemo } from 'react';
import { useTimelineStore, webTimelineIndex, webTimelineRenderer } from '../store/timelineStore';
import { TimelineVirtualizer } from '@ai-video-editor/timeline-engine';

export function useTimelineVirtualization(overscanFrames: number = 60, overscanTracks: number = 1) {
  const { viewport, tracks } = useTimelineStore();

  // 1. Calculate active visible region topologically (horizontal & vertical overscan)
  const visibleRegion = useMemo(() => {
    return TimelineVirtualizer.calculateVisibleRegion(
      viewport,
      tracks,
      overscanFrames,
      overscanTracks
    );
  }, [viewport, tracks, overscanFrames, overscanTracks]);

  // 2. Query spatial index for ONLY intersecting nodes
  const visibleClips = useMemo(() => {
    return TimelineVirtualizer.cullClips(visibleRegion, tracks, webTimelineIndex);
  }, [visibleRegion, tracks]);

  const visibleKeyframes = useMemo(() => {
    return TimelineVirtualizer.cullKeyframes(visibleRegion, webTimelineIndex);
  }, [visibleRegion]);

  const visibleMarkers = useMemo(() => {
    return TimelineVirtualizer.cullMarkers(visibleRegion, webTimelineIndex);
  }, [visibleRegion]);

  // 3. Return culled assets for UI rendering
  return {
    viewport,
    visibleRegion,
    visibleClips,
    visibleKeyframes,
    visibleMarkers,
    tracks: tracks.slice(visibleRegion.startTrackIdx, visibleRegion.endTrackIdx + 1),
    totalTracksCount: tracks.length,
    renderer: webTimelineRenderer,
  };
}
