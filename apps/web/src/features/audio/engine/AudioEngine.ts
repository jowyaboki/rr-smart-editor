import { AudioClip, AudioTrack } from '@ai-video-editor/shared';
import { MixerService } from '../services/MixerService';

export const AudioEngine = {
  evaluateAutomation(clip: AudioClip, frame: number): number {
    const volumeAutomation = clip.automation.find(a => a.property === 'volume');
    if (!volumeAutomation || volumeAutomation.keyframes.length === 0) return clip.volume;

    const keyframes = [...volumeAutomation.keyframes].sort((a, b) => a.frame - b.frame);

    if (frame <= keyframes[0].frame) return keyframes[0].value;
    if (frame >= keyframes[keyframes.length - 1].frame) return keyframes[keyframes.length - 1].value;

    for (let i = 0; i < keyframes.length - 1; i++) {
      const start = keyframes[i];
      const end = keyframes[i+1];
      if (frame >= start.frame && frame <= end.frame) {
        const t = (frame - start.frame) / (end.frame - start.frame);
        return start.value + (end.value - start.value) * t;
      }
    }

    return clip.volume;
  },

  getTrackFinalVolume(track: AudioTrack, masterVolume: number): number {
    return MixerService.calculateTrackVolume(track, masterVolume);
  }
};
