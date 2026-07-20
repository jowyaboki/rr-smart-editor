export * from '@ai-video-editor/collaboration';

export interface WebUserPresence {
  id: string;
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
  playheadPosition: number;
}
