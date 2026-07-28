import { create } from 'zustand';
import { PlaybackState, PlaybackSettings, PlaybackMetrics, FrameContext } from '../types';
import { PlaybackClockManager, BufferService, FrameEvaluator } from '@ai-video-editor/playback-engine';

export const webPlaybackClock = new PlaybackClockManager(300, 30);
export const webPlaybackBuffer = new BufferService(100);

interface PlaybackStoreState {
  currentFrame: number;
  totalFrames: number;
  playbackState: PlaybackState;
  settings: PlaybackSettings;
  metrics: PlaybackMetrics;

  // Evaluation frame context
  variables: Record<string, any>;
  expressions: Record<string, string>;

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (frame: number) => void;
  stepFrame: (delta: number) => void;
  setSettings: (settings: Partial<PlaybackSettings>) => void;
  setTotalFrames: (total: number) => void;
  setContextData: (variables: Record<string, any>, expressions: Record<string, string>) => void;

  // Background pre-buffer trigger
  preBufferAhead: (clips: any[]) => void;
}

export const usePlaybackStore = create<PlaybackStoreState>((set, get) => {
  // Synchronize on frame tick
  webPlaybackClock.on('FrameAdvanced', (data: any) => {
    set({ currentFrame: data.currentFrame });
  });

  webPlaybackClock.on('PlaybackStarted', () => {
    set({ playbackState: 'playing' });
  });

  webPlaybackClock.on('PlaybackPaused', () => {
    set({ playbackState: 'paused' });
  });

  webPlaybackClock.on('PlaybackStopped', () => {
    set({ playbackState: 'stopped', currentFrame: 0 });
  });

  return {
    currentFrame: 0,
    totalFrames: 300,
    playbackState: 'stopped',
    settings: webPlaybackClock.getSettings(),
    metrics: webPlaybackClock.getMetrics(),

    variables: {},
    expressions: {},

    play: () => {
      webPlaybackClock.play();
    },

    pause: () => {
      webPlaybackClock.pause();
    },

    stop: () => {
      webPlaybackClock.stop();
    },

    seek: (frame) => {
      webPlaybackClock.seek(frame);
    },

    stepFrame: (delta) => {
      webPlaybackClock.stepFrame(delta);
    },

    setSettings: (newSettings) => {
      webPlaybackClock.setSettings(newSettings);
      set({ settings: webPlaybackClock.getSettings() });
    },

    setTotalFrames: (total) => {
      webPlaybackClock.setTotalFrames(total);
      set({ totalFrames: total });
    },

    setContextData: (variables, expressions) => {
      set({ variables, expressions });
    },

    preBufferAhead: (clips: any[]) => {
      const { currentFrame, totalFrames, variables, expressions } = get();
      const nextToFetch = webPlaybackBuffer.getFramesToPrefetch(currentFrame, totalFrames);

      // Evaluate frames sequentially in background
      for (const frameIdx of nextToFetch) {
        const frameCtx: FrameContext = {
          currentFrame: frameIdx,
          totalFrames,
          variables,
          expressions,
          timelineClips: clips,
        };

        const startTime = performance.now();
        const evaluated = FrameEvaluator.evaluateFrame(frameIdx, frameCtx, get().settings.quality);
        const latency = performance.now() - startTime;

        webPlaybackBuffer.setFrame(frameIdx, evaluated);
        webPlaybackBuffer.recordLatency(latency);
      }

      // Update metrics
      const activeMetrics = webPlaybackClock.getMetrics();
      const updatedMetrics: PlaybackMetrics = {
        ...activeMetrics,
        bufferUtilization: Math.round((webPlaybackBuffer.getCacheSize() / 100) * 100),
        evaluationLatencyMs: webPlaybackBuffer.getAverageLatency(),
      };
      set({ metrics: updatedMetrics });
    },
  };
});
