import { SnappingConfig } from '../types';
import { VirtualClip, TimelineMarker, VirtualKeyframe } from '../../types';

export class NleSnappingService {
  /**
   * Find the optimal snap frame for a given target frame based on NLE snapping rules.
   */
  public static calculateSnapFrame(
    targetFrame: number,
    config: SnappingConfig,
    clips: VirtualClip[],
    markers: TimelineMarker[],
    keyframes: VirtualKeyframe[],
    playheadFrame?: number
  ): number {
    if (!config.enabled) return targetFrame;

    let bestSnap = targetFrame;
    let minDistance = config.snapThreshold + 1;

    // Helper: update if candidate is closer than current best distance
    const checkCandidate = (candidate: number) => {
      const distance = Math.abs(targetFrame - candidate);
      if (distance < minDistance) {
        minDistance = distance;
        bestSnap = candidate;
      }
    };

    // 1. Snap to playhead
    if (config.snapToPlayhead && playheadFrame !== undefined) {
      checkCandidate(playheadFrame);
    }

    // 2. Snap to markers
    if (config.snapToMarkers) {
      for (const m of markers) {
        checkCandidate(m.frame);
      }
    }

    // 3. Snap to clip edges
    if (config.snapToClipEdges) {
      for (const clip of clips) {
        checkCandidate(clip.startFrame);
        checkCandidate(clip.startFrame + clip.duration);
      }
    }

    // 4. Snap to keyframes
    if (config.snapToKeyframes) {
      for (const kf of keyframes) {
        const clip = clips.find(c => c.id === kf.clipId);
        const absFrame = clip ? clip.startFrame + kf.frame : kf.frame;
        checkCandidate(absFrame);
      }
    }

    return bestSnap;
  }
}
