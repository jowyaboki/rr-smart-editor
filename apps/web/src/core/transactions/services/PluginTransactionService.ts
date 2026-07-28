import { TransactionEngine } from '../engine/TransactionEngine';
import { useTransactionStore } from '../store/transactionStore';
import { TransactionScope, TransactionMetadata, EditorTransaction } from '../types';

export class PluginTransactionService {
  private static validators: Map<string, Array<(params: any) => boolean | string>> = new Map();

  public static createTransaction(
    name: string,
    scope: TransactionScope = 'timeline',
    metadata?: Partial<TransactionMetadata>
  ): EditorTransaction {
    return TransactionEngine.begin(name, scope, {
      ...metadata,
      source: 'plugin',
    });
  }

  public static observe(
    event: 'started' | 'committed' | 'rolled_back' | 'failed' | 'cancelled',
    callback: (data: { transactionId: string; name?: string; error?: string; warnings?: string[] }) => void
  ): () => void {
    const eventNameMap = {
      started: 'TransactionStarted',
      committed: 'TransactionCommitted',
      rolled_back: 'TransactionRolledBack',
      failed: 'TransactionFailed',
      cancelled: 'TransactionCancelled',
    };
    return TransactionEngine.subscribe(eventNameMap[event], callback);
  }

  public static registerHandler(
    type: string,
    execute: (params: any) => any,
    rollback?: (params: any, beforeState?: any) => any
  ): void {
    useTransactionStore.getState().registerHandler(type, execute, rollback);
  }

  public static unregisterHandler(type: string): void {
    useTransactionStore.getState().unregisterHandler(type);
  }

  public static addValidator(type: string, validate: (params: any) => boolean | string): void {
    if (!this.validators.has(type)) {
      this.validators.set(type, []);
    }
    this.validators.get(type)!.push(validate);
  }

  public static validate(type: string, params: any): { valid: boolean; error?: string } {
    const arr = this.validators.get(type) || [];
    for (const val of arr) {
      const res = val(params);
      if (typeof res === 'string') {
        return { valid: false, error: res };
      }
      if (res === false) {
        return { valid: false, error: `Validation failed for plugin operation ${type}` };
      }
    }
    return { valid: true };
  }
}
