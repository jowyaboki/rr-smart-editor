import { Operation } from '@ai-video-editor/collaboration';

export const createTimelineOperation = (
  authorId: string,
  type: string,
  path: string,
  value: any,
  oldValue?: any
): Operation => ({
  id: `op-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: Date.now(),
  authorId,
  type,
  path,
  value,
  oldValue,
});
