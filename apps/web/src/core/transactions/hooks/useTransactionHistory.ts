import { useCallback } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { TransactionHistory } from '../history/TransactionHistory';

export function useTransactionHistory() {
  const undoStack = useTransactionStore((state) => state.undoStack);
  const redoStack = useTransactionStore((state) => state.redoStack);

  const undo = useCallback(async () => {
    await TransactionHistory.undo();
  }, []);

  const redo = useCallback(async () => {
    await TransactionHistory.redo();
  }, []);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    undoStack,
    redoStack,
  };
}
