import { useCallback } from 'react';
import { TransactionEngine } from '../engine/TransactionEngine';
import { TransactionScope, TransactionMetadata, TransactionResult, EditorTransaction } from '../types';

export function useTransaction() {
  const beginTransaction = useCallback((
    name: string,
    scope: TransactionScope = 'timeline',
    metadata?: Partial<TransactionMetadata>
  ): EditorTransaction => {
    return TransactionEngine.begin(name, scope, metadata);
  }, []);

  const commitTransaction = useCallback(async (): Promise<TransactionResult> => {
    return TransactionEngine.commit();
  }, []);

  const rollbackTransaction = useCallback(async (): Promise<void> => {
    return TransactionEngine.rollback();
  }, []);

  const cancelTransaction = useCallback((): void => {
    return TransactionEngine.cancel();
  }, []);

  const executeBatch = useCallback(async (
    name: string,
    run: () => Promise<void>
  ): Promise<TransactionResult> => {
    return TransactionEngine.batch(name, run);
  }, []);

  return {
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    cancelTransaction,
    executeBatch,
  };
}
