import { EditorTransaction, TransactionContext } from '../types';
import { TransactionExecutionError } from '../types/errors';
import { useTransactionStore } from '../store/transactionStore';
import { useTimelineStore } from '../../../store/useTimelineStore';

export class ExecutionService {
  public static takeStateSnapshot(scope: string): Record<string, any> {
    const snapshots: Record<string, any> = {};
    if (scope === 'timeline' || scope === 'global') {
      snapshots['timeline'] = JSON.parse(JSON.stringify(useTimelineStore.getState()));
    }
    return snapshots;
  }

  public static restoreStateSnapshot(storeName: string, state: any): void {
    if (storeName === 'timeline') {
      useTimelineStore.setState(state);
    }
  }

  public static async execute(
    transaction: EditorTransaction,
    context: TransactionContext
  ): Promise<void> {
    const { handlers } = useTransactionStore.getState();

    // 1. Take before state snapshot if not already set by begin()
    if (!transaction.snapshotBefore) {
      transaction.snapshotBefore = this.takeStateSnapshot(transaction.scope);
    }

    // 2. Run operations
    for (const op of transaction.operations) {
      const handler = handlers.get(op.type);
      let attempt = 0;
      const maxRetries = 2; // Support retries!

      while (true) {
        try {
          if (handler) {
            // Run registered handler
            await handler.execute(op.params);
          } else {
            // Run operation execute callback
            await op.execute(context);
          }
          break; // Success!
        } catch (err: any) {
          attempt++;
          if (attempt > maxRetries) {
            throw new TransactionExecutionError(
              `Operation ${op.type} failed after ${maxRetries + 1} attempts: ${err.message}`,
              transaction.id,
              err
            );
          }
          // Short delay before retry
          await new Promise((r) => setTimeout(r, 50));
        }
      }
    }

    // 3. Take after state snapshot
    transaction.snapshotAfter = this.takeStateSnapshot(transaction.scope);
  }
}
