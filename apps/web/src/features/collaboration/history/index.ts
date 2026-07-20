import { HistoryService } from '@ai-video-editor/collaboration';

export const webHistory = new HistoryService();
export const listActivities = () => webHistory.getActivityLogs();
