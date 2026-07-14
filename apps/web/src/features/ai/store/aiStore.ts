import { create } from 'zustand';
import { Message, AIConfig } from '../types';
import { aiOrchestrator } from '../orchestrator/AIOrchestrator';
import { ConversationService } from '../services/ConversationService';

interface AIStore {
  messages: Message[];
  isStreaming: boolean;
  config: AIConfig;

  addMessage: (message: Message) => void;
  sendMessage: (content: string) => Promise<void>;
  updateConfig: (config: Partial<AIConfig>) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  config: {
    provider: 'mock',
    model: 'gpt-4',
    temperature: 0.7,
  },

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  sendMessage: async (content) => {
    const userMsg = ConversationService.createMessage('user', content);
    set((state) => ({ messages: [...state.messages, userMsg] }));

    set({ isStreaming: true });

    let assistantContent = '';
    const assistantMsgId = Math.random().toString(36).substr(2, 9);

    try {
      await aiOrchestrator.stream(get().messages, get().config, (token) => {
        assistantContent += token;
        set((state) => ({
          messages: state.messages.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: assistantContent }
              : m
          ).concat(state.messages.some(m => m.id === assistantMsgId) ? [] : [{
              id: assistantMsgId,
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date().toISOString()
          }])
        }));
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isStreaming: false });
    }
  },

  updateConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
  clearHistory: () => set({ messages: [] }),
}));
