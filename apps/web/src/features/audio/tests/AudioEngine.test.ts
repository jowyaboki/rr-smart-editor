import { AudioEngine } from '../engine/AudioEngine';
import { AudioClip, AudioTrack } from '@ai-video-editor/shared';

export const runAudioTests = () => {
  console.log('🚀 Starting Audio Engine Tests...');

  const mockClip: AudioClip = {
    id: 'clip-1',
    assetId: 'asset-1',
    startFrame: 0,
    durationFrames: 300,
    offsetFrames: 0,
    volume: 1.0,
    pan: 0,
    playbackSpeed: 1,
    effects: [],
    automation: [
      {
        property: 'volume',
        keyframes: [
          { frame: 0, value: 0 },
          { frame: 100, value: 1.0 }
        ]
      }
    ]
  };

  // 1. Evaluate Automation (Fade In)
  const volStart = AudioEngine.evaluateAutomation(mockClip, 0);
  const volMid = AudioEngine.evaluateAutomation(mockClip, 50);
  const volEnd = AudioEngine.evaluateAutomation(mockClip, 100);

  console.log(`Fade In: start=${volStart}, mid=${volMid}, end=${volEnd}`);
  if (volMid !== 0.5) throw new Error('Volume interpolation failed');

  // 2. Track Volume calculation
  const mockTrack: AudioTrack = {
    id: 'track-1',
    name: 'Music',
    clips: [],
    volume: 0.8,
    pan: 0,
    isMuted: false,
    isSolo: false,
    isLocked: false
  };

  const finalVol = AudioEngine.getTrackFinalVolume(mockTrack, 1.0);
  console.log('Track final volume:', finalVol);
  if (finalVol !== 0.8) throw new Error('Track volume calculation failed');

  console.log('✅ Audio Engine Tests Completed.');
};
