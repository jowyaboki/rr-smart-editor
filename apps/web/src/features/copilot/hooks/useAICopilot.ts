import { useCopilotStore } from '../store/copilotStore';
import { copilotService } from '../services';

export function useAICopilot() {
  const store = useCopilotStore();

  const startCopilotSession = (sessionId: string, projectId: string) => {
    copilotService.startSession(sessionId, projectId);
    store.startSession(sessionId, projectId);
  };

  const sendPromptToCopilot = async (prompt: string, projectContext: any) => {
    if (!prompt.trim()) return;

    store.setLoading(true);
    store.appendMessage('user', prompt);

    try {
      const result = await copilotService.processNaturalLanguageCommand(prompt, projectContext);
      store.appendMessage('assistant', result.textResponse);
      store.setActivePlan(result.plan);
      store.setApprovalRequest(result.approvalReq);
    } catch (e: any) {
      store.appendMessage('assistant', `Error processing editing command: ${e.message || e}`);
    } finally {
      store.setLoading(false);
    }
  };

  return {
    messages: store.messages,
    activePlan: store.activePlan,
    approvalRequest: store.approvalRequest,
    loading: store.loading,
    startCopilotSession,
    sendPromptToCopilot,
  };
}
