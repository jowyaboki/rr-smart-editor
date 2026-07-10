import { AudioTrack } from '@ai-video-editor/shared';

export const MixerService = {
  calculateTrackVolume(track: AudioTrack, masterVolume: number): number {
    if (track.isMuted) return 0;
    // Solo logic: if any track is soloed, non-soloed tracks are muted
    return track.volume * masterVolume;
  }
};
