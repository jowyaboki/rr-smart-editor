import { RenderJob, RenderWorker } from '@ai-video-editor/shared';
import { SchedulingStrategy } from '@ai-video-editor/render-core';

export class FIFOSchedulingStrategy implements SchedulingStrategy {
  public name = 'FIFO';

  public async selectJob(
    eligibleJobs: RenderJob[],
    workers: RenderWorker[],
  ): Promise<{ job: RenderJob; workerId: string } | null> {
    if (eligibleJobs.length === 0 || workers.length === 0) return null;

    const sortedJobs = [...eligibleJobs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const activeIdleWorkers = workers.filter((w) => w.status === 'idle');

    for (const job of sortedJobs) {
      const format = job.settings.format;
      const worker = activeIdleWorkers.find((w) => w.capabilities.supportedFormats.includes(format));
      if (worker) {
        return { job, workerId: worker.id };
      }
    }

    return null;
  }
}

export class PrioritySchedulingStrategy implements SchedulingStrategy {
  public name = 'Priority';

  private priorityWeight = {
    critical: 3,
    high: 2,
    normal: 1,
    low: 0,
  };

  public async selectJob(
    eligibleJobs: RenderJob[],
    workers: RenderWorker[],
  ): Promise<{ job: RenderJob; workerId: string } | null> {
    if (eligibleJobs.length === 0 || workers.length === 0) return null;

    const sortedJobs = [...eligibleJobs].sort((a, b) => {
      const pA = this.priorityWeight[a.priority] ?? 1;
      const pB = this.priorityWeight[b.priority] ?? 1;
      if (pA !== pB) return pB - pA;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const activeIdleWorkers = workers.filter((w) => w.status === 'idle');

    for (const job of sortedJobs) {
      const format = job.settings.format;
      const worker = activeIdleWorkers.find((w) => w.capabilities.supportedFormats.includes(format));
      if (worker) {
        return { job, workerId: worker.id };
      }
    }

    return null;
  }
}

export class LeastBusyWorkerSchedulingStrategy implements SchedulingStrategy {
  public name = 'LeastBusyWorker';

  private priorityWeight = {
    critical: 3,
    high: 2,
    normal: 1,
    low: 0,
  };

  public async selectJob(
    eligibleJobs: RenderJob[],
    workers: RenderWorker[],
  ): Promise<{ job: RenderJob; workerId: string } | null> {
    if (eligibleJobs.length === 0 || workers.length === 0) return null;

    const activeWorkers = workers.filter((w) => w.status !== 'offline');
    if (activeWorkers.length === 0) return null;

    const rankedWorkers = [...activeWorkers].sort((a, b) => {
      const loadA = a.status === 'busy' ? 1 : 0;
      const loadB = b.status === 'busy' ? 1 : 0;
      return loadA - loadB;
    });

    const sortedJobs = [...eligibleJobs].sort((a, b) => {
      const pA = this.priorityWeight[a.priority] ?? 1;
      const pB = this.priorityWeight[b.priority] ?? 1;
      if (pA !== pB) return pB - pA;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    for (const worker of rankedWorkers) {
      if (worker.status === 'busy') continue;

      for (const job of sortedJobs) {
        if (worker.capabilities.supportedFormats.includes(job.settings.format)) {
          return { job, workerId: worker.id };
        }
      }
    }

    return null;
  }
}
