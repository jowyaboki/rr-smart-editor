export * from '@ai-video-editor/virtual-production';

export interface UIViewportState {
  showGrid: boolean;
  showFrustums: boolean;
  showLightCones: boolean;
  viewMode: 'camera' | 'top' | 'perspective_3d';
  zoom: number;
}
