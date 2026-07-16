import { EditorTransaction, TransactionContext } from '../types';
import { TransactionValidationError } from '../types/errors';
import { PluginTransactionService } from './PluginTransactionService';

export class ValidationService {
  public static async validateAndTransform(
    transaction: EditorTransaction,
    context: TransactionContext
  ): Promise<EditorTransaction> {
    if (!transaction.name || transaction.name.trim() === '') {
      throw new TransactionValidationError('Transaction name is required', transaction.id);
    }

    for (const op of transaction.operations) {
      // 1. Plugin validation support
      const pluginVal = PluginTransactionService.validate(op.type, op.params);
      if (!pluginVal.valid) {
        throw new TransactionValidationError(
          pluginVal.error || `Plugin validation failed for operation ${op.type}`,
          transaction.id
        );
      }

      // 2. Built-in validations
      if (op.type === 'move_clip' || op.type === 'resize_clip') {
        const { params } = op;
        if (params) {
          if (params.start !== undefined && params.start < 0) {
            context.emitWarning(`Rounding negative start ${params.start} to 0`);
            params.start = 0;
          }
          if (params.duration !== undefined && params.duration <= 0) {
            throw new TransactionValidationError(
              `Clip duration must be greater than 0, got ${params.duration}`,
              transaction.id
            );
          }
          if (params.start !== undefined) {
            params.start = Math.round(params.start);
          }
          if (params.duration !== undefined) {
            params.duration = Math.round(params.duration);
          }
        }
      }

      if (op.type === 'delete_clip' || op.type === 'delete_asset') {
        const { params } = op;
        if (!params || !params.id) {
          throw new TransactionValidationError(
            `Operation ${op.type} requires an ID parameter`,
            transaction.id
          );
        }
      }
    }

    return transaction;
  }
}
