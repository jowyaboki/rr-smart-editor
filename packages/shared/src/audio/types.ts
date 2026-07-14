export interface AudioMarker {
  id: string;
  frame: number;
  label: string;
  color?: string;
}

export interface AudioAutomation {
  property: 'volume' | 'pan' | 'gain';
  keyframes: { frame: number; value: number; easing?: string }[];
}

export interface AudioEffect {
  id: string;
  type: 'fade-in' | 'fade-out' | 'eq' | 'compressor' | 'limiter' | 'reverb';
  settings: Record<string, any>;
  enabled: boolean;
}

export interface AudioClip {
  id: string;
  assetId: string;
  startFrame: number;
  durationFrames: number;
  offsetFrames: number; // For trimming start of source
  volume: number; // 0-1
  pan: number; // -1 (left) to 1 (right)
  playbackSpeed: number;
  effects: AudioEffect[];
  automation: AudioAutomation[];
}

export interface AudioTrack {
  id: string;
  name: string;
  clips: AudioClip[];
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  isLocked: boolean;
  color?: string;
}

export interface WaveformData {
  assetId: string;
  peaks: number[];
  sampleRate: number;
  duration: number;
}
