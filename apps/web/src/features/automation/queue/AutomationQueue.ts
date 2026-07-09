import { BatchJob, AutomationTemplate } from '@ai-video-editor/shared';
import { BatchEngine } from '../engine/BatchEngine';
import { useAutomationStore } from '../store/automationStore';

export class AutomationQueue {
  private static instance: AutomationQueue;
  private queue: { job: BatchJob, template: AutomationTemplate }[] = [];
  private isProcessing: boolean = false;

  private constructor() {}

  static getInstance(): AutomationQueue {
    if (!AutomationQueue.instance) {
      AutomationQueue.instance = new AutomationQueue();
    }
    return AutomationQueue.instance;
  }

  enqueue(job: BatchJob, template: AutomationTemplate): void {
    this.queue.push({ job, template });
    useAutomationStore.getState().updateBatchJob(job.id, { status: 'queued' });
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const { job, template } = this.queue.shift()!;

    const engine = BatchEngine.getInstance();
    await engine.run(job, template);

    this.isProcessing = false;
    this.processNext();
  }

  cancelJob(jobId: string): void {
    const engine = BatchEngine.getInstance();
    engine.stop(jobId);
    this.queue = this.queue.filter(q => q.job.id !== jobId);
  }
}
