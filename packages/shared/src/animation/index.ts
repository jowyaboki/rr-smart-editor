export type EasingType = 'linear' | 'step' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bezier' | 'elastic' | 'bounce' | 'back';

export interface Keyframe {
  id: string;
  property: string;
  frame: number;
  value: number | string;
  interpolation: 'linear' | 'step' | 'bezier';
  easing: EasingType;
  bezierPoints?: [number, number, number, number];
  selected: boolean;
  locked: boolean;
}

export interface AnimatedProperty {
  name: string;
  keyframes: Keyframe[];
}

export interface AnimationTrack {
  clipId: string;
  properties: AnimatedProperty[];
}
