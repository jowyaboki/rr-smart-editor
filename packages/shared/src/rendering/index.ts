export type RenderStatus = 'pending' | 'preparing' | 'rendering' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface RenderSettings {
  filename: string;
  width: number;
  height: number;
  fps: number;
  codec: 'h264' | 'h265' | 'vp8' | 'vp9';
  bitrate?: number;
  quality: number; // 0-100
  audioEnabled: boolean;
  transparency: boolean;
  outputFormat: 'mp4' | 'webm' | 'mov';
}

export interface RenderProgress {
  frame: number;
  totalFrames: number;
  percentage: number;
  fps: number;
  timeRemaining?: number; // In seconds
}

export interface RenderResult {
  jobId: string;
  url?: string;
  size?: number;
  duration?: number;
  error?: string;
}

export interface RenderJob {
  id: string;
  projectId: string;
  projectName: string;
  status: RenderStatus;
  settings: RenderSettings;
  progress: RenderProgress;
  createdAt: string;
  updatedAt: string;
  result?: RenderResult;
}

export interface RenderPreset {
  id: string;
  name: string;
  settings: Partial<RenderSettings>;
  category: string;
}
