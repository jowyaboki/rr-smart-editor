import { useTimelineStore, Track, Clip } from '../../../store/useTimelineStore';

/**
 * Memoized selector for the list of tracks.
 */
export const selectTracks = (state: { tracks: Track[] }) => state.tracks;

/**
 * Selector for playhead frame.
 */
export const selectPlayhead = (state: { playhead: number }) => state.playhead;

/**
 * Selector for zoom scale.
 */
export const selectZoom = (state: { zoom: number }) => state.zoom;

/**
 * Selector for snap toggle state.
 */
export const selectSnap = (state: { snap: boolean }) => state.snap;

/**
 * Selector for playback rate.
 */
export const selectPlaybackRate = (state: { playbackRate: number }) => state.playbackRate;

/**
 * Selector for playing status.
 */
export const selectIsPlaying = (state: { isPlaying: boolean }) => state.isPlaying;

/**
 * Optimized selector to retrieve a specific track by its ID.
 */
export const selectTrackById = (trackId: string) => {
  return (state: { tracks: Track[] }) => state.tracks.find((t) => t.id === trackId);
};

/**
 * Highly optimized memoized selector to retrieve a specific clip by its ID.
 * This prevents unnecessary parent re-renders when clip properties are altered.
 */
export const selectClipById = (trackId: string, clipId: string) => {
  return (state: { tracks: Track[] }) => {
    const track = state.tracks.find((t) => t.id === trackId);
    if (!track) return null;
    return track.clips.find((c) => c.id === clipId) || null;
  };
};
