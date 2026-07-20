export * from '@ai-video-editor/package-manager';
export * from '@ai-video-editor/extension-sdk';

export interface WebExtension {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  category: string;
  installed: boolean;
  enabled: boolean;
  downloads?: number;
  rating?: number;
}
