import { TransactionEngine } from '../engine/TransactionEngine';
import { TransactionResult, TransactionScope } from '../types';

export class AITransactionService {
  /**
   * Executes a list of operations as a single, atomic transaction batch on behalf of an AI agent.
   */
  public static async executeAIBatch(
    batchName: string,
    operations: Array<{
      name: string;
      scope?: TransactionScope;
      execute: () => void | Promise<void>;
    }>
  ): Promise<TransactionResult> {
    return TransactionEngine.batch(batchName, async () => {
      for (const op of operations) {
        TransactionEngine.begin(op.name, op.scope || 'timeline', {
          source: 'ai',
          tags: ['ai-agent', 'creative-studio'],
          description: `AI operation: ${op.name}`,
        });

        try {
          await op.execute();
          await TransactionEngine.commit();
        } catch (err) {
          TransactionEngine.cancel();
          throw err;
        }
      }
    });
  }
}
