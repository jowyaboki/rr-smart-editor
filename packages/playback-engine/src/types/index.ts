import { z } from 'zod';

export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'buffering';

export const PlaybackStateSchema = z.enum(['playing', 'paused', 'stopped', 'buffering']);

export interface PlaybackSettings {
  loop: boolean;
  reverse: boolean;
  playbackRate: number;      // e.g. 1.0, 2.0, -1.0
  quality: 'low' | 'high';   // dynamic preview quality resolution
  latencyCompensationMs: number;
}

export const PlaybackSettingsSchema = z.object({
  loop: z.boolean().default(false),
  reverse: z.boolean().default(false),
  playbackRate: z.number().default(1.0),
  quality: z.enum(['low', 'high']).default('high'),
  latencyCompensationMs: z.number().nonnegative().default(0),
});

export interface PlaybackClock {
  id: string;
  startTime: number;         // system timestamp on start
  currentFrame: number;
  totalFrames: number;
  fps: number;               // standard target fps, e.g. 30 or 60
}

export const PlaybackClockSchema = z.object({
  id: z.string(),
  startTime: z.number(),
  currentFrame: z.number().nonnegative(),
  totalFrames: z.number().positive(),
  fps: z.number().positive(),
});

export interface FrameContext {
  currentFrame: number;
  totalFrames: number;
  variables: Record<string, any>;
  expressions: Record<string, string>;
  timelineClips: any[];
}

export const FrameContextSchema = z.object({
  currentFrame: z.number().nonnegative(),
  totalFrames: z.number().positive(),
  variables: z.record(z.any()),
  expressions: z.record(z.string()),
  timelineClips: z.array(z.any()),
});

export interface PreviewFrame {
  frameIndex: number;
  width: number;
  height: number;
  quality: 'low' | 'high';
  renderData: Record<string, any>; // contains the compiled values for the canvas/player to render
  timestamp: string;
}

export const PreviewFrameSchema = z.object({
  frameIndex: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
  quality: z.enum(['low', 'high']),
  renderData: z.record(z.any()),
  timestamp: z.string(),
});

export interface PlaybackMetrics {
  currentFps: number;
  droppedFramesCount: number;
  totalRenderedFrames: number;
  bufferUtilization: number; // percentage oflook-ahead buffered frames
  evaluationLatencyMs: number;
}

export const PlaybackMetricsSchema = z.object({
  currentFps: z.number().nonnegative(),
  droppedFramesCount: z.number().nonnegative(),
  totalRenderedFrames: z.number().nonnegative(),
  bufferUtilization: z.number().min(0).max(100),
  evaluationLatencyMs: z.number().nonnegative(),
});

export interface PlaybackContext {
  state: PlaybackState;
  settings: PlaybackSettings;
  clock: PlaybackClock;
  metrics: PlaybackMetrics;
}

export const PlaybackContextSchema = z.object({
  state: PlaybackStateSchema,
  settings: PlaybackSettingsSchema,
  clock: PlaybackClockSchema,
  metrics: PlaybackMetricsSchema,
});
