import { useTransactionStore } from '../store/transactionStore';
import { RollbackService } from '../services/RollbackService';
import { ExecutionService } from '../execution/ExecutionService';
import { EditorTransaction, TransactionBatch } from '../types';

export class TransactionHistory {
  private static getContext(tx: EditorTransaction) {
    return {
      transactionId: tx.id,
      metadata: tx.metadata,
      scope: tx.scope,
      state: {},
      warnings: [],
      getStoreState: (name: string) => {},
      setStoreState: (name: string, state: any) => {
        ExecutionService.restoreStateSnapshot(name, state);
      },
      emitWarning: (msg: string) => {},
    };
  }

  public static canUndo(): boolean {
    return useTransactionStore.getState().undoStack.length > 0;
  }

  public static canRedo(): boolean {
    return useTransactionStore.getState().redoStack.length > 0;
  }

  public static async undo(): Promise<void> {
    const item = useTransactionStore.getState().popFromUndo();
    if (!item) return;

    if ('transactions' in item) {
      // It's a TransactionBatch
      const context = this.getContext(item.transactions[0]);
      await RollbackService.rollbackBatch(item, context);
    } else {
      // It's a single EditorTransaction
      const context = this.getContext(item);
      await RollbackService.rollback(item, context);
      item.status = 'rolled_back';
    }

    // Push to redo stack
    useTransactionStore.getState().pushToRedo(item);
  }

  public static async redo(): Promise<void> {
    const item = useTransactionStore.getState().popFromRedo();
    if (!item) return;

    if ('transactions' in item) {
      // Re-apply all transactions in the batch
      for (const tx of item.transactions) {
        if (tx.snapshotAfter) {
          for (const [storeName, afterState] of Object.entries(tx.snapshotAfter)) {
            ExecutionService.restoreStateSnapshot(storeName, afterState);
          }
        }
        tx.status = 'committed';
      }
      item.status = 'committed';
    } else {
      // Re-apply single transaction
      if (item.snapshotAfter) {
        for (const [storeName, afterState] of Object.entries(item.snapshotAfter)) {
          ExecutionService.restoreStateSnapshot(storeName, afterState);
        }
      }
      item.status = 'committed';
    }

    // Push back to undo stack
    useTransactionStore.getState().pushToUndo(item);
  }
}
