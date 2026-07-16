import { create } from 'zustand';
import { EditorTransaction, TransactionBatch, TransactionScope } from '../types';

interface TransactionState {
  undoStack: (EditorTransaction | TransactionBatch)[];
  redoStack: (EditorTransaction | TransactionBatch)[];
  activeTransaction: EditorTransaction | null;
  activeBatch: TransactionBatch | null;
  activeScopes: TransactionScope[];
  handlers: Map<string, { execute: (params: any) => any; rollback?: (params: any, beforeState?: any) => any }>;

  // Actions
  pushToUndo: (item: EditorTransaction | TransactionBatch) => void;
  popFromUndo: () => (EditorTransaction | TransactionBatch) | undefined;
  pushToRedo: (item: EditorTransaction | TransactionBatch) => void;
  popFromRedo: () => (EditorTransaction | TransactionBatch) | undefined;
  clearHistory: () => void;
  setActiveTransaction: (tx: EditorTransaction | null) => void;
  setActiveBatch: (batch: TransactionBatch | null) => void;
  setActiveScopes: (scopes: TransactionScope[]) => void;
  registerHandler: (type: string, execute: (params: any) => any, rollback?: (params: any, beforeState?: any) => any) => void;
  unregisterHandler: (type: string) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  activeTransaction: null,
  activeBatch: null,
  activeScopes: [],
  handlers: new Map(),

  pushToUndo: (item) => set((state) => ({ undoStack: [...state.undoStack, item] })),
  popFromUndo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return undefined;
    const last = undoStack[undoStack.length - 1];
    set({ undoStack: undoStack.slice(0, -1) });
    return last;
  },
  pushToRedo: (item) => set((state) => ({ redoStack: [...state.redoStack, item] })),
  popFromRedo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return undefined;
    const last = redoStack[redoStack.length - 1];
    set({ redoStack: redoStack.slice(0, -1) });
    return last;
  },
  clearHistory: () => set({ undoStack: [], redoStack: [] }),
  setActiveTransaction: (tx) => set({ activeTransaction: tx }),
  setActiveBatch: (batch) => set({ activeBatch: batch }),
  setActiveScopes: (scopes) => set({ activeScopes: scopes }),
  registerHandler: (type, execute, rollback) => {
    const { handlers } = get();
    const newHandlers = new Map(handlers);
    newHandlers.set(type, { execute, rollback });
    set({ handlers: newHandlers });
  },
  unregisterHandler: (type) => {
    const { handlers } = get();
    const newHandlers = new Map(handlers);
    newHandlers.delete(type);
    set({ handlers: newHandlers });
  },
}));
