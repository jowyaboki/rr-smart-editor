export * from '@ai-video-editor/dam';

export interface WebDAMAsset {
  id: string;
  displayName: string;
  category: string;
  status: string;
  url: string;
  isPinned: boolean;
}
