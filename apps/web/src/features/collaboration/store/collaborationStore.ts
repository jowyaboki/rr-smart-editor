import { create } from 'zustand';
import { Participant, Presence, Operation, Comment, Lock } from '../types';

export interface CollaborationState {
  sessionId: string | null;
  projectId: string | null;
  participants: Participant[];
  presences: Record<string, Presence>;
  operations: Operation[];
  comments: Comment[];
  locks: Record<string, Lock>;
  isConnected: boolean;

  // Actions
  joinSession: (sessionId: string, projectId: string, participants: Participant[]) => void;
  leaveSession: () => void;
  updateLocalPresence: (userId: string, presence: Presence) => void;
  updateRemotePresences: (presences: Record<string, Presence>) => void;
  appendOperation: (op: Operation) => void;
  setComments: (comments: Comment[]) => void;
  appendComment: (comment: Comment) => void;
  updateLock: (targetId: string, lock: Lock | null) => void;
  setConnected: (connected: boolean) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  sessionId: null,
  projectId: null,
  participants: [],
  presences: {},
  operations: [],
  comments: [],
  locks: {},
  isConnected: true,

  joinSession: (sessionId, projectId, participants) => set({ sessionId, projectId, participants, isConnected: true }),

  leaveSession: () => set({ sessionId: null, projectId: null, participants: [], presences: {}, operations: [], comments: [], locks: {}, isConnected: false }),

  updateLocalPresence: (userId, presence) => set((state) => ({
    presences: { ...state.presences, [userId]: presence },
  })),

  updateRemotePresences: (presences) => set({ presences }),

  appendOperation: (op) => set((state) => ({ operations: [...state.operations, op] })),

  setComments: (comments) => set({ comments }),

  appendComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),

  updateLock: (targetId, lock) => set((state) => {
    const updated = { ...state.locks };
    if (lock) {
      updated[targetId] = lock;
    } else {
      delete updated[targetId];
    }
    return { locks: updated };
  }),

  setConnected: (isConnected) => set({ isConnected }),
}));
