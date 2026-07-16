export type TransactionScope = 'timeline' | 'scenes' | 'brand' | 'media' | 'workflows' | 'global';

export type TransactionStatus = 'pending' | 'committed' | 'rolled_back' | 'failed' | 'cancelled';

export interface TransactionMetadata {
  userId?: string;
  source: 'user' | 'ai' | 'automation' | 'plugin';
  description?: string;
  timestamp: string;
  tags?: string[];
  [key: string]: any;
}

export interface TransactionOperation {
  id: string;
  type: string;
  params?: any;
  execute: (context: TransactionContext) => void | Promise<void>;
  rollback?: (context: TransactionContext) => void | Promise<void>;
}

export interface TransactionContext {
  transactionId: string;
  metadata: TransactionMetadata;
  scope: TransactionScope;
  state: Record<string, any>;
  warnings: string[];
  getStoreState: (storeName: string) => any;
  setStoreState: (storeName: string, state: any) => void;
  emitWarning: (message: string) => void;
}

export interface EditorTransaction {
  id: string;
  name: string;
  status: TransactionStatus;
  metadata: TransactionMetadata;
  scope: TransactionScope;
  operations: TransactionOperation[];
  snapshotBefore?: Record<string, any>;
  snapshotAfter?: Record<string, any>;
  error?: string;
}

export interface TransactionResult {
  success: boolean;
  transactionId: string;
  status: TransactionStatus;
  warnings: string[];
  error?: string;
}

export interface TransactionBatch {
  id: string;
  name: string;
  transactions: EditorTransaction[];
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  metadata: TransactionMetadata;
}

export interface TransactionError extends Error {
  transactionId: string;
  stage: string;
  originalError: any;
}
