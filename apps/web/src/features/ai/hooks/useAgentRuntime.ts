import { useRef } from 'react';
import { AgentRuntime } from '../runtime';
import { useAiStore } from '../store/aiStore';

export function useAgentRuntime() {
  const runtimeRef = useRef<AgentRuntime | null>(null);
  const store = useAiStore();

  if (!runtimeRef.current) {
    runtimeRef.current = new AgentRuntime();
  }

  const runtime = runtimeRef.current;

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    store.setRunning(true);
    store.addMessage('user', message);

    try {
      const result = await runtime.executeAgentRun(message, {
        permissions: ['read_project', 'write_project', 'write_timeline', 'read_assets', 'render', 'publish'],
        requireConfirmation: true,
        onConfirm: async (toolName, args) => {
          // Automatic confirmation mock for standard execution
          return true;
        },
      });

      store.setCurrentPlan(result.plan || null);
      store.setToolResults(result.toolResults);
      store.addMessage('assistant', result.textResponse);
    } catch (err: any) {
      store.addMessage('assistant', `Error executing agent run: ${err.message || err}`);
    } finally {
      store.setRunning(false);
    }
  };

  return {
    runtime,
    messages: store.messages,
    currentPlan: store.currentPlan,
    toolResults: store.toolResults,
    isRunning: store.isRunning,
    isCancelled: store.isCancelled,
    sendMessage,
    cancelRun: () => {
      runtime.contextManager.cancel();
      store.cancelRun();
    },
    clearHistory: store.clearHistory,
  };
}
