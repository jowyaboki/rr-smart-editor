import { CopilotService } from '@ai-video-editor/ai-copilot';

export const copilotService = new CopilotService();
export { CopilotService };
export const startSession = (id: string, projectId: string) => {
  return copilotService.startSession(id, projectId);
};
export const getActiveSession = () => copilotService.getSession();
