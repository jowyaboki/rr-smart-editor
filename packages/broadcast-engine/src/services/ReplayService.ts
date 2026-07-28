import { ReplayConfig, ReplayClip, ReplayBuffer } from '../types';

export class ReplayService {
  private config: ReplayConfig;
  private buffer: ReplayBuffer;
  private savedClips: ReplayClip[] = [];
  private isBuffering: boolean = false;

  constructor(initialConfig: ReplayConfig) {
    this.config = initialConfig;
    this.buffer = {
      id: `replay_buffer_${Date.now()}`,
      status: 'idle',
      maxDurationSeconds: initialConfig.maxDurationSeconds,
      frameRate: 60,
      resolution: initialConfig.resolution,
    };
  }

  public getBufferStatus(): ReplayBuffer {
    return this.buffer;
  }

  public getSavedClips(): ReplayClip[] {
    return this.savedClips;
  }

  public startReplayBuffer(): void {
    this.isBuffering = true;
    this.buffer.status = 'active';
  }

  public stopReplayBuffer(): void {
    this.isBuffering = false;
    this.buffer.status = 'idle';
  }

  public captureInstantReplay(preTriggerSeconds: number = 5, notes?: string): ReplayClip {
    if (!this.isBuffering) {
      throw new Error('Replay buffer is not currently active.');
    }

    const clip: ReplayClip = {
      id: `replay_clip_${Date.now()}`,
      name: `Instant Replay - ${new Date().toLocaleTimeString()}`,
      startTimeStamp: new Date(Date.now() - preTriggerSeconds * 1000).toISOString(),
      durationMs: preTriggerSeconds * 1000,
      playbackSpeed: 0.5, // Default slow motion replay
      markerNotes: notes || 'Exciting action capture',
      rating: 5,
    };

    this.savedClips.push(clip);
    return clip;
  }

  public setPlaybackSpeed(clipId: string, speed: number): void {
    const clip = this.savedClips.find((c) => c.id === clipId);
    if (!clip) throw new Error(`Replay clip ${clipId} not found.`);
    clip.playbackSpeed = speed;
  }

  public addMarkerToClip(clipId: string, notes: string): void {
    const clip = this.savedClips.find((c) => c.id === clipId);
    if (!clip) throw new Error(`Replay clip ${clipId} not found.`);
    clip.markerNotes = notes;
  }
}
