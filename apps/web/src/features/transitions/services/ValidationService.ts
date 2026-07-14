import { TransitionInstance, TimelineTrack } from '@ai-video-editor/shared';

export const ValidationService = {
  validatePlacement(instance: TransitionInstance, track: TimelineTrack): string[] {
    const errors: string[] = [];

    if (instance.fromClipId && instance.toClipId) {
      const fromClip = track.clips.find(c => c.id === instance.fromClipId);
      const toClip = track.clips.find(c => c.id === instance.toClipId);

      if (!fromClip || !toClip) {
        errors.push('One or both clips for the transition are missing');
      } else if (fromClip.startFrame + fromClip.durationFrames !== toClip.startFrame) {
        // Technically transitions can be at overlaps, but for RR Smart Editor
        // we might enforce they be at cut points.
        // errors.push('Transitions must be placed at clip boundaries');
      }
    }

    return errors;
  }
};
