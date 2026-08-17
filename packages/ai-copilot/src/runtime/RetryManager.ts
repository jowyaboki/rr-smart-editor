import { ExecutionNode, RetryPolicy } from './types';

export class RetryManager {
  static defaultPolicy: RetryPolicy = {
    maxRetries: 3,
    backoffMs: 100,
    exponential: true
  };

  static shouldRetry(node: ExecutionNode, currentAttempts: number, errorMsg: string): boolean {
    const policy = node.retryPolicy || this.defaultPolicy;
    if (currentAttempts >= policy.maxRetries) {
      return false;
    }
    if (policy.retryableErrors && policy.retryableErrors.length > 0) {
      return policy.retryableErrors.some(err => errorMsg.includes(err));
    }
    return true;
  }

  static getBackoffDelay(node: ExecutionNode, attempt: number): number {
    const policy = node.retryPolicy || this.defaultPolicy;
    if (policy.exponential) {
      return policy.backoffMs * Math.pow(2, attempt - 1);
    }
    return policy.backoffMs;
  }
}
