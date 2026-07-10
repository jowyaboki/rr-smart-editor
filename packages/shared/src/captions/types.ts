export interface CaptionWord {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  confidence?: number;
}

export interface CaptionSegment {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  words: CaptionWord[];
  speakerId?: string;
  styleId?: string;
}

export interface Speaker {
  id: string;
  name: string;
  color?: string;
}

export interface Transcript {
  id: string;
  segments: CaptionSegment[];
  language: string;
  speakers: Speaker[];
}

export interface CaptionTrack {
  id: string;
  name: string;
  transcript: Transcript;
  styleId: string;
  isEnabled: boolean;
}

export interface CaptionPreset {
  id: string;
  name: string;
  styleId: string; // References a TextStyle from the Text Engine
  animationType: 'word-by-word' | 'sentence' | 'fade' | 'pop';
}
