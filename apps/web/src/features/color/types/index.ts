export * from '@ai-video-editor/color-science';

export interface UIScopesState {
  activeScope: 'waveform' | 'vectorscope' | 'rgb_parade' | 'histogram' | 'false_color';
  subSampleRate: number;
  falseColorOverlay: boolean;
}
