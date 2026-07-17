export interface SyncTrackInfo {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
  type: 'video' | 'audio' | string;
}

export class SynchronizationService {
  private static latencyOffsetMs: number = 0;
  private static trackOverrides: Record<string, SyncTrackInfo> = {};

  public static setLatencyOffset(ms: number): void {
    this.latencyOffsetMs = ms;
  }

  public static setTrackState(trackId: string, info: SyncTrackInfo): void {
    this.trackOverrides[trackId] = info;
  }

  /**
   * Determine if an audio waveform or media track is active/audible.
   * Supports Lock, Mute, and Solo track rules.
   */
  public static isTrackAudible(trackId: string): boolean {
    const track = this.trackOverrides[trackId];
    if (!track) return true;

    // Solo rule: if any other track is solo, and this track is not solo, it is muted
    const anySolo = Object.values(this.trackOverrides).some(t => t.isSolo);
    if (anySolo && !track.isSolo) {
      return false;
    }

    // Mute rule
    if (track.isMuted) {
      return false;
    }

    return true;
  }

  /**
   * Calculate latency compensation offset.
   */
  public static getSyncOffsetFrames(fps: number): number {
    return Math.round((this.latencyOffsetMs / 1000) * fps);
  }

  /**
   * Mock Audio Waveform Synchronization checker.
   * Maps playhead frame to normalized frequency peak amplitude [0.0 to 1.0].
   */
  public static getWaveformPeak(frame: number, duration: number): number {
    // Generate deterministic sine-peak values representing audio waves
    return Math.abs(Math.sin(frame * 0.1) * Math.cos(frame * 0.05));
  }
}
