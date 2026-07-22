export * from '@ai-video-editor/template-engine';

export interface WebTemplate {
  id: string;
  displayName: string;
  description: string;
  category: string;
  version: string;
  installed: boolean;
  isFavorite: boolean;
  rating?: number;
}
