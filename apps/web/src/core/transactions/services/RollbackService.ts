import { EditorTransaction, TransactionBatch, TransactionContext } from '../types';
import { TransactionRollbackError } from '../types/errors';

export class RollbackService {
  public static async rollback(
    transaction: EditorTransaction,
    context: TransactionContext
  ): Promise<void> {
    try {
      // 1. Restore store snapshots if they exist
      if (transaction.snapshotBefore) {
        for (const [storeName, beforeState] of Object.entries(transaction.snapshotBefore)) {
          context.setStoreState(storeName, beforeState);
        }
      }

      // 2. Run custom rollback callbacks in reverse order
      const reversedOperations = [...transaction.operations].reverse();
      for (const op of reversedOperations) {
        if (op.rollback) {
          await op.rollback(context);
        }
      }
    } catch (err: any) {
      throw new TransactionRollbackError(
        `Rollback failed for transaction ${transaction.id}: ${err.message}`,
        transaction.id,
        err
      );
    }
  }

  public static async rollbackBatch(
    batch: TransactionBatch,
    context: TransactionContext
  ): Promise<void> {
    // Rollback all transactions in the batch in reverse order
    const reversedTxs = [...batch.transactions].reverse();
    for (const tx of reversedTxs) {
      if (tx.status === 'committed' || tx.status === 'failed' || tx.status === 'pending') {
        await this.rollback(tx, context);
        tx.status = 'rolled_back';
      }
    }
    batch.status = 'rolled_back';
  }
}
