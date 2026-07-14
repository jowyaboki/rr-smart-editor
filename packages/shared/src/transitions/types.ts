export type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'in' | 'out';

export type TransitionType =
  | 'fade'
  | 'crossfade'
  | 'dip-to-black'
  | 'slide'
  | 'push'
  | 'zoom'
  | 'scale'
  | 'blur'
  | 'wipe'
  | 'circle-reveal'
  | 'linear-wipe';

export interface TransitionSettings {
  durationFrames: number;
  direction?: TransitionDirection;
  intensity?: number; // 0-1
  easing?: string; // 'ease-in', 'ease-out', etc.
  color?: string; // For dip-to-black or colored wipes
}

export interface Transition {
  id: string;
  type: TransitionType;
  settings: TransitionSettings;
}

export interface TransitionInstance {
  id: string;
  transitionId: string;
  trackId: string;
  fromClipId?: string; // If null, it's an intro transition
  toClipId?: string;   // If null, it's an outro transition
  atFrame: number;     // The frame where the transition is centered or begins
}

export interface TransitionPreset {
  id: string;
  name: string;
  type: TransitionType;
  defaultSettings: TransitionSettings;
}
