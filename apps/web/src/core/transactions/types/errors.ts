export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly transactionId: string,
    public readonly stage: 'validation' | 'execution' | 'rollback' | 'commit',
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

export class TransactionValidationError extends TransactionError {
  constructor(message: string, transactionId: string, originalError?: any) {
    super(message, transactionId, 'validation', originalError);
    this.name = 'TransactionValidationError';
  }
}

export class TransactionExecutionError extends TransactionError {
  constructor(message: string, transactionId: string, originalError?: any) {
    super(message, transactionId, 'execution', originalError);
    this.name = 'TransactionExecutionError';
  }
}

export class TransactionRollbackError extends TransactionError {
  constructor(message: string, transactionId: string, originalError?: any) {
    super(message, transactionId, 'rollback', originalError);
    this.name = 'TransactionRollbackError';
  }
}
