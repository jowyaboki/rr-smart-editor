import { CollaborationService } from '@ai-video-editor/collaboration';

export const webCollaborationService = new CollaborationService();

export const startCollaborationSession = (sessionId: string, projectId: string, participants: any[]) => {
  return webCollaborationService.startSession(sessionId, projectId, participants);
};
export const getActiveSession = () => webCollaborationService.getSession();
