import { useEffect } from 'react';
import { usePlaybackStore, webPlaybackClock, webPlaybackBuffer } from '../store/playbackStore';
import { FrameContext, PreviewFrame } from '../types';
import { FrameEvaluator } from '@ai-video-editor/playback-engine';

export function usePlayback(timelineClips: any[] = []) {
  const store = usePlaybackStore();

  // 1. Background look-ahead buffering coordinator
  useEffect(() => {
    if (store.playbackState === 'playing') {
      const interval = setInterval(() => {
        store.preBufferAhead(timelineClips);
      }, 250); // check and fetch every 250ms
      return () => clearInterval(interval);
    }
  }, [store.playbackState, store.currentFrame, timelineClips]);

  // 2. Fetch or evaluate active preview frame reactively
  const activeFrame: PreviewFrame = (() => {
    const cached = webPlaybackBuffer.getFrame(store.currentFrame);
    if (cached) return cached;

    // Cache miss -> evaluate synchronously on the fly
    const frameCtx: FrameContext = {
      currentFrame: store.currentFrame,
      totalFrames: store.totalFrames,
      variables: store.variables,
      expressions: store.expressions,
      timelineClips,
    };
    return FrameEvaluator.evaluateFrame(store.currentFrame, frameCtx, store.settings.quality);
  })();

  return {
    currentFrame: store.currentFrame,
    totalFrames: store.totalFrames,
    playbackState: store.playbackState,
    settings: store.settings,
    metrics: store.metrics,

    // Core actions
    play: store.play,
    pause: store.pause,
    stop: store.stop,
    seek: store.seek,
    stepFrame: store.stepFrame,
    setSettings: store.setSettings,
    setTotalFrames: store.setTotalFrames,
    setContextData: store.setContextData,

    // Computed active frame render data
    activeFrame,
    averageLatencyMs: webPlaybackBuffer.getAverageLatency(),
  };
}
