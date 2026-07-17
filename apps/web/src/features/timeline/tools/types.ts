import { VirtualClip, VirtualTrack } from '../types';

export type EditToolMode =
  | 'select'
  | 'razor'
  | 'ripple'
  | 'roll'
  | 'slip'
  | 'slide'
  | 'stretch'
  | 'hand'
  | 'zoom';

export type ClipOperationType =
  | 'split'
  | 'trim'
  | 'ripple_delete'
  | 'lift'
  | 'extract'
  | 'duplicate'
  | 'reverse'
  | 'freeze_frame'
  | 'speed_change'
  | 'replace_clip';

export interface NleMarker {
  id: string;
  clipId?: string; // If undefined, this is a timeline-level marker, otherwise clip-level
  name: string;
  frame: number;
  type: 'timeline' | 'clip' | 'chapter';
  comments?: string;
  labels?: string[];
  color?: string;
}

export interface SnappingConfig {
  enabled: boolean;
  snapToPlayhead: boolean;
  snapToMarkers: boolean;
  snapToClipEdges: boolean;
  snapToTransitions: boolean;
  snapToKeyframes: boolean;
  snapToAudioPeaks: boolean;
  snapThreshold: number; // Snapping distance in frames
}

export interface TrackStateOverrides {
  isLocked: boolean;
  isMuted: boolean;
  isSolo: boolean;
  isHidden: boolean;
  color?: string;
  group?: string; // Grouping track folders
}

export interface KeyboardShortcutConfig {
  playPause: string;     // default Space
  jklPlayback: boolean;  // toggle J-K-L playback rate
  markIn: string;        // default I
  markOut: string;       // default O
  zoomIn: string;        // default = or +
  zoomOut: string;       // default -
  splitClip: string;     // default Ctrl+B or S
  rippleDelete: string;  // default Shift+Delete
}

export interface NleClipGroup {
  id: string;
  name: string;
  clipIds: string[];
}

export interface NleClipLink {
  id: string;
  videoClipId: string;
  audioClipId: string;
}
