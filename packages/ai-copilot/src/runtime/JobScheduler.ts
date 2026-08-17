import { ExecutionNode, ExecutionContextSnapshot } from './types';

export class JobScheduler {
  private concurrencyLimit = 10;
  private activeJobsCount = 0;
  private queue: { node: ExecutionNode; context: ExecutionContextSnapshot; signal: AbortSignal; resolve: (val: any) => void; reject: (err: any) => void }[] = [];

  constructor(concurrencyLimit = 10) {
    this.concurrencyLimit = concurrencyLimit;
  }

  setConcurrencyLimit(limit: number): void {
    this.concurrencyLimit = limit;
  }

  async scheduleNode(
    node: ExecutionNode,
    context: ExecutionContextSnapshot,
    signal: AbortSignal
  ): Promise<Record<string, any>> {
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const job = { node, context, signal, resolve, reject };
      this.queue.push(job);
      this.processQueue(startTime);
    });
  }

  private processQueue(startTime: number) {
    while (this.activeJobsCount < this.concurrencyLimit && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      this.activeJobsCount++;
      const dispatchLatency = performance.now() - startTime;
      if (job.context.metrics) {
        job.context.metrics.schedulerLatencyMs = (job.context.metrics.schedulerLatencyMs || 0) + dispatchLatency;
      }

      (async () => {
        try {
          if (job.signal.aborted) {
            throw new Error(`Job for node '${job.node.id}' aborted before execution`);
          }

          let result: Record<string, any> = {};
          if (job.node.handler) {
            result = await job.node.handler(job.context, job.signal);
          }
          job.resolve(result);
        } catch (err) {
          job.reject(err);
        } finally {
          this.activeJobsCount--;
          this.processQueue(startTime);
        }
      })();
    }
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  getActiveCount(): number {
    return this.activeJobsCount;
  }
}
