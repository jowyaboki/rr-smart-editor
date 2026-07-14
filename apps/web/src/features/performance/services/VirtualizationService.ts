export interface VirtualizationBounds {
  scrollTop: number;
  scrollLeft: number;
  viewportWidth: number;
  viewportHeight: number;
  totalTracksCount: number;
}

export interface VisibleRanges {
  visibleTrackIndices: number[]; // indices of tracks visible vertically
  visibleClipIds: Set<string>; // IDs of clips visible horizontally
  virtualizationSavingsPercentage: number;
}

export class VirtualizationService {
  private static readonly TRACK_HEIGHT_PX = 60;

  /**
   * Calculates which tracks, clips, and elements are visible given scroll indices.
   */
  public static calculateVisibility(params: {
    bounds: VirtualizationBounds;
    tracks: any[];
    zoom: number;
  }): VisibleRanges {
    const { bounds, tracks, zoom } = params;
    const { scrollTop, scrollLeft, viewportWidth, viewportHeight } = bounds;

    // 1. Vertical tracks virtualization range
    const startTrackIdx = Math.max(0, Math.floor(scrollTop / this.TRACK_HEIGHT_PX));
    // Add buffer of 1 track above and below to prevent blank spots on fast scroll
    const endTrackIdx = Math.min(
      tracks.length - 1,
      Math.ceil((scrollTop + viewportHeight) / this.TRACK_HEIGHT_PX),
    );

    const visibleTrackIndices: number[] = [];
    for (
      let i = Math.max(0, startTrackIdx - 1);
      i <= Math.min(tracks.length - 1, endTrackIdx + 1);
      i++
    ) {
      visibleTrackIndices.push(i);
    }

    // 2. Horizontal clips virtualization range
    const visibleClipIds = new Set<string>();
    let totalClipsAnalyzed = 0;
    let visibleClipsCount = 0;

    const viewportLeftFrame = Math.max(0, Math.floor(scrollLeft / zoom));
    const viewportRightFrame = Math.max(0, Math.ceil((scrollLeft + viewportWidth) / zoom));

    // Add frame buffer
    const bufferFrames = Math.max(30, Math.round(100 / zoom)); // 1-second or 100px buffer
    const startFrameWithBuffer = Math.max(0, viewportLeftFrame - bufferFrames);
    const endFrameWithBuffer = viewportRightFrame + bufferFrames;

    tracks.forEach((track, trackIdx) => {
      if (Array.isArray(track.clips)) {
        totalClipsAnalyzed += track.clips.length;

        // If track is outside vertical visibility bounds, do not render clips
        const isTrackVerticallyVisible = visibleTrackIndices.includes(trackIdx);
        if (!isTrackVerticallyVisible) return;

        track.clips.forEach((clip: any) => {
          const clipStart = clip.start;
          const clipEnd = clip.start + clip.duration;

          // Check horizontal intersection
          const isHorizontallyVisible =
            clipEnd >= startFrameWithBuffer && clipStart <= endFrameWithBuffer;

          if (isHorizontallyVisible) {
            visibleClipIds.add(clip.id);
            visibleClipsCount++;
          }
        });
      }
    });

    const renderedElementsCount = visibleTrackIndices.length + visibleClipsCount;
    const totalElementsCount = tracks.length + totalClipsAnalyzed;
    const savings =
      totalElementsCount > 0
        ? Math.round((1 - renderedElementsCount / totalElementsCount) * 100)
        : 0;

    return {
      visibleTrackIndices,
      visibleClipIds,
      virtualizationSavingsPercentage: Math.max(0, savings),
    };
  }
}
