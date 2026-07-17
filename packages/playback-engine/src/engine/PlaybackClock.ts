import { PlaybackClock, PlaybackSettings, PlaybackState, PlaybackMetrics } from '../types';

export type PlaybackEvent =
  | 'PlaybackStarted'
  | 'PlaybackPaused'
  | 'PlaybackStopped'
  | 'FrameAdvanced'
  | 'FrameDropped'
  | 'SeekCompleted'
  | 'LoopCompleted';

export class PlaybackClockManager {
  private clock: PlaybackClock;
  private settings: PlaybackSettings;
  private state: PlaybackState = 'stopped';
  private metrics: PlaybackMetrics;

  private intervalId: any = null;
  private listeners: Record<string, Set<(data?: any) => void>> = {};

  constructor(
    totalFrames: number = 300,
    fps: number = 30,
    settings?: Partial<PlaybackSettings>
  ) {
    this.clock = {
      id: `clock_${Date.now()}`,
      startTime: 0,
      currentFrame: 0,
      totalFrames,
      fps,
    };

    this.settings = {
      loop: false,
      reverse: false,
      playbackRate: 1.0,
      quality: 'high',
      latencyCompensationMs: 0,
      ...settings,
    };

    this.metrics = {
      currentFps: fps,
      droppedFramesCount: 0,
      totalRenderedFrames: 0,
      bufferUtilization: 0,
      evaluationLatencyMs: 0,
    };
  }

  // Event System
  public on(event: PlaybackEvent, callback: (data?: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);
  }

  public off(event: PlaybackEvent, callback: (data?: any) => void): void {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
  }

  private emit(event: PlaybackEvent, data?: any): void {
    const list = this.listeners[event];
    if (list) {
      for (const cb of list) {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in playback listener:`, err);
        }
      }
    }
  }

  // Getters
  public getClock(): PlaybackClock {
    return this.clock;
  }

  public getSettings(): PlaybackSettings {
    return this.settings;
  }

  public getState(): PlaybackState {
    return this.state;
  }

  public getMetrics(): PlaybackMetrics {
    return this.metrics;
  }

  // Actions
  public play(): void {
    if (this.state === 'playing') return;

    this.state = 'playing';
    this.clock.startTime = performance.now();
    this.emit('PlaybackStarted', { currentFrame: this.clock.currentFrame });

    const tickMs = 1000 / (this.clock.fps * Math.abs(this.settings.playbackRate));

    this.intervalId = setInterval(() => {
      this.tick();
    }, tickMs);
  }

  public pause(): void {
    if (this.state !== 'playing') return;

    this.state = 'paused';
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.emit('PlaybackPaused', { currentFrame: this.clock.currentFrame });
  }

  public stop(): void {
    this.pause();
    this.state = 'stopped';
    this.clock.currentFrame = 0;
    this.emit('PlaybackStopped', { currentFrame: 0 });
  }

  public seek(frame: number): void {
    const target = Math.max(0, Math.min(frame, this.clock.totalFrames));
    this.clock.currentFrame = target;
    this.emit('SeekCompleted', { currentFrame: target });
    this.emit('FrameAdvanced', { currentFrame: target });
  }

  public stepFrame(delta: number): void {
    this.seek(this.clock.currentFrame + delta);
  }

  public setSettings(settings: Partial<PlaybackSettings>): void {
    this.settings = { ...this.settings, ...settings };

    // If playing, restart interval to adapt speed rate
    if (this.state === 'playing') {
      this.pause();
      this.play();
    }
  }

  public setTotalFrames(total: number): void {
    this.clock.totalFrames = Math.max(1, total);
  }

  // Tick operation
  private tick(): void {
    const rate = this.settings.playbackRate;
    const direction = rate >= 0 ? 1 : -1;
    let nextFrame = this.clock.currentFrame + direction;

    let loopTriggered = false;

    if (direction === 1 && nextFrame >= this.clock.totalFrames) {
      if (this.settings.loop) {
        nextFrame = 0;
        loopTriggered = true;
      } else {
        nextFrame = this.clock.totalFrames;
        this.pause();
        this.state = 'stopped';
        this.emit('PlaybackStopped', { currentFrame: nextFrame });
      }
    } else if (direction === -1 && nextFrame < 0) {
      if (this.settings.loop) {
        nextFrame = this.clock.totalFrames - 1;
        loopTriggered = true;
      } else {
        nextFrame = 0;
        this.pause();
        this.state = 'stopped';
        this.emit('PlaybackStopped', { currentFrame: 0 });
      }
    }

    this.clock.currentFrame = nextFrame;
    this.metrics.totalRenderedFrames++;

    this.emit('FrameAdvanced', { currentFrame: nextFrame });

    if (loopTriggered) {
      this.emit('LoopCompleted', { currentFrame: nextFrame });
    }
  }
}
