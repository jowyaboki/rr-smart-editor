export * from '@ai-video-editor/audio-engine';

export interface UIMixerState {
  showMeters: boolean;
  selectedTrackId: string | null;
  meterRefreshRateHz: number;
}
