import { useAudioStore } from '../store/audioStore';
import { AudioClip, AudioTrack } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const useAudio = () => {
  const store = useAudioStore();

  const addAudioTrack = (name: string) => {
    const track: AudioTrack = {
      id: uuidv4(),
      name,
      clips: [],
      volume: 1.0,
      pan: 0,
      isMuted: false,
      isSolo: false,
      isLocked: false
    };
    store.addTrack(track);
    return track;
  };

  return {
    tracks: store.tracks,
    masterVolume: store.masterVolume,
    addAudioTrack,
    updateTrack: store.updateTrack,
    updateClip: store.updateClip
  };
};
