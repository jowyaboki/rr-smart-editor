import { create } from 'zustand';
import { WebCopilotMessage, ExecutionPlan, ApprovalRequest, SuggestedChange } from '../types';

export interface CopilotState {
  sessionId: string | null;
  projectId: string | null;
  messages: WebCopilotMessage[];
  activePlan: ExecutionPlan | null;
  approvalRequest: ApprovalRequest | null;
  suggestions: SuggestedChange[];
  loading: boolean;

  // Actions
  startSession: (sessionId: string, projectId: string) => void;
  appendMessage: (role: WebCopilotMessage['role'], content: string) => void;
  setActivePlan: (plan: ExecutionPlan | null) => void;
  setApprovalRequest: (req: ApprovalRequest | null) => void;
  setSuggestions: (suggestions: SuggestedChange[]) => void;
  removeSuggestion: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useCopilotStore = create<CopilotState>((set) => ({
  sessionId: null,
  projectId: null,
  messages: [],
  activePlan: null,
  approvalRequest: null,
  suggestions: [],
  loading: false,

  startSession: (sessionId, projectId) => set({ sessionId, projectId }),

  appendMessage: (role, content) => set((state) => ({
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

  setActivePlan: (activePlan) => set({ activePlan }),

  setApprovalRequest: (approvalRequest) => set({ approvalRequest }),

  setSuggestions: (suggestions) => set({ suggestions }),

  removeSuggestion: (id) => set((state) => ({
    suggestions: state.suggestions.filter((s) => s.id !== id),
  })),

  setLoading: (loading) => set({ loading }),

  clear: () => set({ sessionId: null, projectId: null, messages: [], activePlan: null, approvalRequest: null, suggestions: [], loading: false }),
}));
