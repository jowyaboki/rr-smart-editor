import { VirtualClip, VirtualTrack } from '../types';

export class GeometryService {
  /**
   * Convert frame index to horizontal pixel offset.
   */
  public static frameToX(frame: number, pxPerFrame: number): number {
    return Math.max(0, frame) * pxPerFrame;
  }

  /**
   * Convert horizontal pixel offset to frame index.
   */
  public static xToFrame(x: number, pxPerFrame: number): number {
    return Math.max(0, Math.round(x / pxPerFrame));
  }

  /**
   * Calculate top-Y position for a specific track.
   */
  public static getTrackY(trackId: string, tracks: VirtualTrack[]): number {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.yOffset : 0;
  }

  /**
   * Precompute bounding rectangle coordinates for a clip.
   */
  public static getClipRect(
    clip: VirtualClip,
    tracks: VirtualTrack[],
    pxPerFrame: number
  ): { x: number; y: number; width: number; height: number } {
    const track = tracks.find(t => t.id === clip.trackId);
    const x = this.frameToX(clip.startFrame, pxPerFrame);
    const width = clip.duration * pxPerFrame;
    const y = track ? track.yOffset : 0;
    const height = track ? track.height : 50;

    return { x, y, width, height };
  }

  /**
   * Snapping logic: Snaps target frame to boundaries of existing clips if close enough.
   */
  public static getSnapFrame(
    targetFrame: number,
    allClips: VirtualClip[],
    snapThresholdInFrames: number = 5
  ): number {
    let bestSnap = targetFrame;
    let minDistance = snapThresholdInFrames + 1;

    for (const clip of allClips) {
      const clipStart = clip.startFrame;
      const clipEnd = clip.startFrame + clip.duration;

      // Check snap to clip start
      const distStart = Math.abs(targetFrame - clipStart);
      if (distStart < minDistance) {
        minDistance = distStart;
        bestSnap = clipStart;
      }

      // Check snap to clip end
      const distEnd = Math.abs(targetFrame - clipEnd);
      if (distEnd < minDistance) {
        minDistance = distEnd;
        bestSnap = clipEnd;
      }
    }

    return bestSnap;
  }
}
