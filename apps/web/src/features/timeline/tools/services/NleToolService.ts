import { VirtualClip, VirtualTrack } from '../../types';

export class NleToolService {
  /**
   * Razor Tool - Split a clip at a specific absolute timeline frame.
   * Returns the two resulting clips or throws if split point is invalid.
   */
  public static splitClip(
    clip: VirtualClip,
    splitFrame: number
  ): { left: VirtualClip; right: VirtualClip } {
    if (splitFrame <= clip.startFrame || splitFrame >= clip.startFrame + clip.duration) {
      throw new Error('Split frame must fall strictly inside the clip boundaries.');
    }

    const leftDuration = splitFrame - clip.startFrame;
    const rightDuration = clip.duration - leftDuration;

    const left: VirtualClip = {
      ...clip,
      id: `${clip.id}_left_${Date.now()}`,
      duration: leftDuration,
    };

    const right: VirtualClip = {
      ...clip,
      id: `${clip.id}_right_${Date.now()}`,
      startFrame: splitFrame,
      duration: rightDuration,
      sourceDuration: clip.sourceDuration ? clip.sourceDuration : undefined,
    };

    // If there is metadata or source crop, adjust source duration/crop accordingly
    if (clip.metadata) {
      right.metadata = { ...clip.metadata, isSplitRight: true };
      left.metadata = { ...clip.metadata, isSplitLeft: true };
    }

    return { left, right };
  }

  /**
   * Ripple Edit - Trims clip's start or end, and shifts all subsequent clips on the track.
   * direction: 'start' (trimming left edge) or 'end' (trimming right edge)
   */
  public static applyRippleEdit(
    clipId: string,
    deltaFrames: number, // positive (extending) or negative (shrinking)
    edge: 'start' | 'end',
    clips: VirtualClip[]
  ): VirtualClip[] {
    const targetClip = clips.find(c => c.id === clipId);
    if (!targetClip) return clips;

    return clips.map(clip => {
      // 1. If it's the target clip, adjust startFrame or duration
      if (clip.id === clipId) {
        if (edge === 'start') {
          const newStart = Math.max(0, clip.startFrame + deltaFrames);
          const actualDelta = newStart - clip.startFrame;
          const newDuration = Math.max(1, clip.duration - actualDelta);
          return {
            ...clip,
            startFrame: newStart,
            duration: newDuration,
          };
        } else {
          const newDuration = Math.max(1, clip.duration + deltaFrames);
          return {
            ...clip,
            duration: newDuration,
          };
        }
      }

      // 2. If it is a subsequent clip on the SAME track, shift its startFrame
      if (clip.trackId === targetClip.trackId && clip.startFrame > targetClip.startFrame) {
        return {
          ...clip,
          startFrame: Math.max(0, clip.startFrame + deltaFrames),
        };
      }

      return clip;
    });
  }

  /**
   * Roll Edit - Adjusts the transition point between two adjacent clips.
   * Shrinks Clip A's duration and extends Clip B's duration/startFrame by the same delta,
   * keeping the overall timeline duration identical.
   */
  public static applyRollEdit(
    clipAId: string,
    clipBId: string,
    deltaFrames: number, // positive shifts edit point right, negative shifts left
    clips: VirtualClip[]
  ): VirtualClip[] {
    return clips.map(clip => {
      if (clip.id === clipAId) {
        // Clip A is on the left: adjust duration
        return {
          ...clip,
          duration: Math.max(1, clip.duration + deltaFrames),
        };
      }
      if (clip.id === clipBId) {
        // Clip B is on the right: adjust startFrame and duration
        const newStart = Math.max(0, clip.startFrame + deltaFrames);
        const actualDelta = newStart - clip.startFrame;
        return {
          ...clip,
          startFrame: newStart,
          duration: Math.max(1, clip.duration - actualDelta),
        };
      }
      return clip;
    });
  }

  /**
   * Slip Edit - Shifts a clip's in/out points of source media (metadata)
   * while keeping its absolute timeline startFrame and duration completely identical.
   */
  public static applySlipEdit(
    clipId: string,
    slipFrames: number, // positive (slips forward), negative (slips backward)
    clips: VirtualClip[]
  ): VirtualClip[] {
    return clips.map(clip => {
      if (clip.id === clipId) {
        const metadata = clip.metadata ? { ...clip.metadata } : {};
        const currentSourceStart = metadata.sourceStartFrame || 0;
        metadata.sourceStartFrame = Math.max(0, currentSourceStart + slipFrames);

        return {
          ...clip,
          metadata,
        };
      }
      return clip;
    });
  }

  /**
   * Slide Edit - Shifts a clip horizontally, trimming preceding Clip A
   * and extending succeeding Clip B, keeping edit continuity.
   */
  public static applySlideEdit(
    clipId: string,
    slideDelta: number,
    clipAId: string, // Preceding clip
    clipBId: string, // Succeeding clip
    clips: VirtualClip[]
  ): VirtualClip[] {
    return clips.map(clip => {
      if (clip.id === clipId) {
        // Slide target clip: just shifts horizontally
        return {
          ...clip,
          startFrame: Math.max(0, clip.startFrame + slideDelta),
        };
      }
      if (clip.id === clipAId) {
        // Preceding clip: adjusts duration
        return {
          ...clip,
          duration: Math.max(1, clip.duration + slideDelta),
        };
      }
      if (clip.id === clipBId) {
        // Succeeding clip: shifts start and trims duration
        const newStart = Math.max(0, clip.startFrame + slideDelta);
        const actualDelta = newStart - clip.startFrame;
        return {
          ...clip,
          startFrame: newStart,
          duration: Math.max(1, clip.duration - actualDelta),
        };
      }
      return clip;
    });
  }

  /**
   * Lift Operation - Deletes a clip, leaving a clean gap on the timeline.
   */
  public static liftClip(
    clipId: string,
    clips: VirtualClip[]
  ): VirtualClip[] {
    return clips.filter(c => c.id !== clipId);
  }

  /**
   * Extract Operation - Deletes a clip and closes the gap (ripple delete).
   */
  public static extractClip(
    clipId: string,
    clips: VirtualClip[]
  ): VirtualClip[] {
    const targetClip = clips.find(c => c.id === clipId);
    if (!targetClip) return clips;

    const remaining = clips.filter(c => c.id !== clipId);
    const duration = targetClip.duration;

    return remaining.map(clip => {
      if (clip.trackId === targetClip.trackId && clip.startFrame > targetClip.startFrame) {
        return {
          ...clip,
          startFrame: Math.max(0, clip.startFrame - duration),
        };
      }
      return clip;
    });
  }
}
