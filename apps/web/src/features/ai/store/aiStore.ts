import { create } from 'zustand';
import { ChatMessage, AgentPlan, ToolResult } from '../types';

export interface AiState {
  messages: ChatMessage[];
  currentPlan: AgentPlan | null;
  toolResults: ToolResult[];
  isRunning: boolean;
  isCancelled: boolean;

  // Actions
  addMessage: (role: ChatMessage['role'], content: string) => void;
  setCurrentPlan: (plan: AgentPlan | null) => void;
  setToolResults: (results: ToolResult[]) => void;
  setRunning: (isRunning: boolean) => void;
  cancelRun: () => void;
  clearHistory: () => void;
}

export const useAiStore = create<AiState>((set) => ({
  messages: [],
  currentPlan: null,
  toolResults: [],
  isRunning: false,
  isCancelled: false,

  addMessage: (role, content) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: `msg-${Math.random().toString(36).substr(2, 9)}`,
        role,
        content,
        timestamp: Date.now(),
      },
    ],
  })),

  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  setToolResults: (results) => set({ toolResults: results }),

  setRunning: (isRunning) => set({ isRunning, isCancelled: isRunning ? false : undefined }),

  cancelRun: () => set({ isCancelled: true, isRunning: false }),

  clearHistory: () => set({ messages: [], currentPlan: null, toolResults: [], isRunning: false, isCancelled: false }),
}));
