import { useTransactionStore } from '../store/transactionStore';
import { ValidationService } from '../services/ValidationService';
import { ExecutionService } from '../execution/ExecutionService';
import { RollbackService } from '../services/RollbackService';
import { EditorTransaction, TransactionBatch, TransactionContext, TransactionScope, TransactionMetadata, TransactionResult } from '../types';

export class TransactionEngine {
  private static listeners: Map<string, Array<(data: any) => void>> = new Map();

  public static subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter((cb) => cb !== callback));
    };
  }

  private static emit(event: string, data: any): void {
    const arr = this.listeners.get(event) || [];
    for (const cb of arr) {
      try { cb(data); } catch {}
    }
  }

  private static getContext(tx: EditorTransaction, warnings: string[]): TransactionContext {
    return {
      transactionId: tx.id,
      metadata: tx.metadata,
      scope: tx.scope,
      state: {},
      warnings,
      getStoreState: (name: string) => {},
      setStoreState: (name: string, state: any) => {
        ExecutionService.restoreStateSnapshot(name, state);
      },
      emitWarning: (msg: string) => {
        warnings.push(msg);
      },
    };
  }

  private static txStack: EditorTransaction[] = [];

  public static begin(
    name: string,
    scope: TransactionScope = 'timeline',
    metadata?: Partial<TransactionMetadata>
  ): EditorTransaction {
    const id = `tx_${Math.random().toString(36).substr(2, 9)}`;
    const tx: EditorTransaction = {
      id,
      name,
      status: 'pending',
      scope,
      metadata: {
        source: 'user',
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      operations: [],
    };

    // Capture state snapshot before any mutations are done inside the transaction!
    tx.snapshotBefore = ExecutionService.takeStateSnapshot(scope);

    const { activeTransaction, setActiveTransaction } = useTransactionStore.getState();

    if (activeTransaction) {
      this.txStack.push(activeTransaction);
    }

    setActiveTransaction(tx);
    this.emit('TransactionStarted', { transactionId: id, name, timestamp: new Date().toISOString() });
    return tx;
  }

  public static async commit(): Promise<TransactionResult> {
    const { activeTransaction, setActiveTransaction, pushToUndo, activeBatch } = useTransactionStore.getState();
    if (!activeTransaction) {
      return { success: false, transactionId: '', status: 'failed', warnings: [], error: 'No active transaction' };
    }

    const warnings: string[] = [];
    const context = this.getContext(activeTransaction, warnings);

    try {
      const transformedTx = await ValidationService.validateAndTransform(activeTransaction, context);

      await ExecutionService.execute(transformedTx, context);

      transformedTx.status = 'committed';

      if (this.txStack.length > 0) {
        const parent = this.txStack.pop()!;
        parent.operations.push(...transformedTx.operations);
        parent.snapshotAfter = transformedTx.snapshotAfter;
        setActiveTransaction(parent);
      } else {
        setActiveTransaction(null);
        if (activeBatch) {
          activeBatch.transactions.push(transformedTx);
        } else {
          pushToUndo(transformedTx);
        }
      }

      this.emit('TransactionCommitted', { transactionId: transformedTx.id, warnings, timestamp: new Date().toISOString() });
      return { success: true, transactionId: transformedTx.id, status: 'committed', warnings };
    } catch (err: any) {
      activeTransaction.status = 'failed';
      activeTransaction.error = err.message;

      try {
        await RollbackService.rollback(activeTransaction, context);
      } catch (rollbackErr) {
        console.error('Nesting rollback error:', rollbackErr);
      }

      if (this.txStack.length > 0) {
        const parent = this.txStack.pop()!;
        setActiveTransaction(parent);
        await this.rollback();
      } else {
        setActiveTransaction(null);
      }

      this.emit('TransactionFailed', { transactionId: activeTransaction.id, error: err.message, timestamp: new Date().toISOString() });
      return { success: false, transactionId: activeTransaction.id, status: 'failed', warnings, error: err.message };
    }
  }

  public static async rollback(): Promise<void> {
    const { activeTransaction, setActiveTransaction } = useTransactionStore.getState();
    if (!activeTransaction) return;

    const context = this.getContext(activeTransaction, []);
    await RollbackService.rollback(activeTransaction, context);

    activeTransaction.status = 'rolled_back';

    if (this.txStack.length > 0) {
      const parent = this.txStack.pop()!;
      setActiveTransaction(parent);
      await this.rollback();
    } else {
      setActiveTransaction(null);
    }

    this.emit('TransactionRolledBack', { transactionId: activeTransaction.id, timestamp: new Date().toISOString() });
  }

  public static cancel(): void {
    const { activeTransaction, setActiveTransaction } = useTransactionStore.getState();
    if (!activeTransaction) return;

    activeTransaction.status = 'cancelled';

    if (this.txStack.length > 0) {
      setActiveTransaction(this.txStack.pop()!);
    } else {
      setActiveTransaction(null);
    }

    this.emit('TransactionCancelled', { transactionId: activeTransaction.id, timestamp: new Date().toISOString() });
  }

  public static async retry(): Promise<TransactionResult> {
    return this.commit();
  }

  public static async batch(name: string, run: () => Promise<void>): Promise<TransactionResult> {
    const id = `batch_${Math.random().toString(36).substr(2, 9)}`;
    const batch: TransactionBatch = {
      id,
      name,
      transactions: [],
      status: 'pending',
      metadata: {
        source: 'user',
        timestamp: new Date().toISOString(),
      },
    };

    const { setActiveBatch, pushToUndo } = useTransactionStore.getState();
    setActiveBatch(batch);

    try {
      await run();
      batch.status = 'committed';
      setActiveBatch(null);
      pushToUndo(batch);
      return { success: true, transactionId: id, status: 'committed', warnings: [] };
    } catch (err: any) {
      batch.status = 'failed';
      setActiveBatch(null);

      const lastTx = batch.transactions[0];
      if (lastTx) {
        const context = this.getContext(lastTx, []);
        await RollbackService.rollbackBatch(batch, context);
      }

      return { success: false, transactionId: id, status: 'failed', warnings: [], error: err.message };
    }
  }
}
