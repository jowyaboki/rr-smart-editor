// Core models and interfaces for the Broadcast Studio & Live Production Engine

export interface BroadcastProject {
  id: string;
  name: string;
  sceneCollections: SceneCollection[];
  activeSceneCollectionId: string;
  streamingDestinations: StreamingDestination[];
  recordingConfig: RecordingConfig;
  replayConfig: ReplayConfig;
  createdAt: string;
  updatedAt: string;
}

export interface LiveScene {
  id: string;
  name: string;
  inputs: LiveInput[];
  overlays: Overlay[];
  transitionIn?: LiveTransition;
  audioMixPercent: number;
}

export interface SceneCollection {
  id: string;
  name: string;
  scenes: LiveScene[];
}

export type OverlayType =
  | 'lower_third'
  | 'ticker'
  | 'countdown'
  | 'timer'
  | 'logo'
  | 'watermark'
  | 'breaking_news'
  | 'scoreboard'
  | 'statistics'
  | 'custom';

export interface Overlay {
  id: string;
  name: string;
  type: OverlayType;
  isVisible: boolean;
  position: { x: number; y: number; width: number; height: number };
  opacity: number;
  zIndex: number;
  properties: Record<string, any>;
}

export interface OverlayLayer {
  id: string;
  name: string;
  overlays: Overlay[];
}

export type TransitionType = 'cut' | 'fade' | 'mix' | 'wipe' | 'stinger';

export interface LiveTransition {
  id: string;
  type: TransitionType;
  durationMs: number;
  stingerVideoAssetId?: string; // Optional path/id for stinger transitions
}

export interface SwitcherState {
  previewSceneId: string | null;
  programSceneId: string | null;
  activeTransition: LiveTransition | null;
  isTransitioning: boolean;
  transitionProgress: number; // 0.0 to 1.0
}

export type LiveInputType =
  | 'camera'
  | 'screen_capture'
  | 'video_file'
  | 'audio_device'
  | 'browser_source'
  | 'media_pipeline_source'
  | 'ndi'
  | 'sdi'
  | 'custom';

export interface LiveInput {
  id: string;
  name: string;
  type: LiveInputType;
  status: 'connected' | 'disconnected' | 'error';
  properties: Record<string, any>;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
}

export interface LiveOutput {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'error';
  type: 'stream' | 'record' | 'decklink' | 'ndi';
}

export interface ReplayBuffer {
  id: string;
  status: 'idle' | 'active' | 'paused';
  maxDurationSeconds: number;
  frameRate: number;
  resolution: { width: number; height: number };
}

export interface ReplayClip {
  id: string;
  name: string;
  startTimeStamp: string;
  durationMs: number;
  playbackSpeed: number; // e.g. 0.5 for slow motion, 1.0 for normal, etc.
  markerNotes?: string;
  rating?: number;
}

export interface ReplayPlaylist {
  id: string;
  name: string;
  clips: ReplayClip[];
}

export type StreamingProtocol = 'rtmp' | 'srt' | 'webrtc' | 'custom';

export interface StreamingDestination {
  id: string;
  name: string;
  protocol: StreamingProtocol;
  streamUrl: string;
  streamKey?: string;
  isEnabled: boolean;
  status: 'idle' | 'connecting' | 'streaming' | 'error';
  errorMessage?: string;
}

export type RecordingType = 'local' | 'iso' | 'program' | 'segment';

export interface RecordingConfig {
  id: string;
  type: RecordingType;
  format: 'mp4' | 'mkv' | 'mov';
  bitrateKbps: number;
  autoRotate: boolean;
  rotationDurationMinutes: number;
  outputDirectory: string;
}

export interface RecordingSession {
  id: string;
  status: 'idle' | 'recording' | 'paused' | 'error';
  startTimeStamp?: string;
  durationSeconds: number;
  fileSizeMb: number;
  activeFilePath?: string;
  rotatedFilePaths: string[];
}

export interface PerformanceMetrics {
  fps: number;
  droppedFrames: number;
  bitrateKbps: number;
  latencyMs: number;
  cpuPercent: number;
  gpuPercent: number;
  memoryMb: number;
  networkUploadSpeedMbps: number;
}

// Plugin extension points
export interface StreamingProviderPlugin {
  id: string;
  name: string;
  protocol: StreamingProtocol;
  connect: (url: string, key?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendVideoFrame: (frame: any) => void;
  sendAudioBuffer: (buffer: any) => void;
}

export interface InputProviderPlugin {
  id: string;
  name: string;
  type: LiveInputType;
  initialize: (properties: Record<string, any>) => Promise<void>;
  startCapture: () => void;
  stopCapture: () => void;
}

export interface OverlayTypePlugin {
  id: string;
  name: string;
  type: OverlayType;
  renderOverlay: (canvasContext: any, overlay: Overlay, dimensions: { width: number; height: number }) => void;
}

export interface GraphicsPackPlugin {
  id: string;
  name: string;
  overlays: Overlay[];
}

export interface TransitionPackPlugin {
  id: string;
  name: string;
  transitions: LiveTransition[];
}

export interface ReplayProviderPlugin {
  id: string;
  name: string;
  startBuffer: (config: ReplayConfig) => Promise<void>;
  captureClip: (preTriggerSeconds: number, postTriggerSeconds: number) => Promise<ReplayClip>;
}

export interface ReplayConfig {
  maxDurationSeconds: number;
  resolution: { width: number; height: number };
}
