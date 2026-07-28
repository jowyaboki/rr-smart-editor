import { queueService } from '../queue/QueueService';
import { workerService } from '../workers/WorkerService';
import { queueRepository } from '../storage/QueueRepository';
import { logger } from '../../utils/logger';
import { localWorker } from '../workers/LocalWorker';
import { SchedulingStrategy } from '@ai-video-editor/render-core';
import { PrioritySchedulingStrategy } from './SchedulingStrategy';
import { RenderStateMachine } from '../services/RenderStateMachine';
import { renderEventBus } from '../services/RenderEventSystem';

export class RenderScheduler {
  private interval?: NodeJS.Timeout;
  private isScheduling: boolean = false;
  private maxRetries: number = 3;
  private workerTimeoutMs: number = 15000;
  private strategy: SchedulingStrategy;

  private jobRetries = new Map<string, number>();

  constructor(strategy: SchedulingStrategy = new PrioritySchedulingStrategy()) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: SchedulingStrategy) {
    this.strategy = strategy;
    logger.info(`Scheduler switched to scheduling strategy: ${strategy.name}`);
  }

  public getStrategy(): SchedulingStrategy {
    return this.strategy;
  }

  public start() {
    this.interval = setInterval(async () => {
      await this.tick();
    }, 1000);
    logger.info('RenderScheduler started.');
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    logger.info('RenderScheduler stopped.');
  }

  public async tick() {
    if (this.isScheduling) return;
    this.isScheduling = true;

    try {
      await this.detectWorkerTimeouts();

      const eligibleJobs = await queueService.getNextEligibleJobs();
      if (eligibleJobs.length > 0) {
        const workers = await workerService.listWorkers();
        const activeWorkers = workers.filter(
          (w) =>
            w.status !== 'offline' &&
            Date.now() - new Date(w.lastHeartbeat).getTime() < this.workerTimeoutMs,
        );

        const match = await this.strategy.selectJob(eligibleJobs, activeWorkers);

        if (match) {
          const { job, workerId } = match;

          logger.info(`Scheduler (${this.strategy.name}): Assigning job ${job.id} to worker ${workerId}`);

          renderEventBus.emit('WorkerAssigned', {
            jobId: job.id,
            workerId,
            timestamp: new Date().toISOString(),
          });

          if (workerId === localWorker.id) {
            const assigned = await localWorker.assignJob(job.id);
            if (!assigned) {
              logger.warn(`Failed to assign job ${job.id} to local worker.`);
            }
          } else {
            await workerService.updateWorkerStatus(workerId, 'busy', job.id);
            RenderStateMachine.checkAndTransition(job.status, 'rendering');
            job.status = 'rendering';
            job.workerId = workerId;
            job.startedAt = new Date().toISOString();
            await queueRepository.saveJob(job);
          }
        }
      }
    } catch (err) {
      logger.error('Error inside RenderScheduler tick', err);
    } finally {
      this.isScheduling = false;
    }
  }

  private async detectWorkerTimeouts() {
    const workers = await workerService.listWorkers();
    const now = Date.now();

    for (const worker of workers) {
      if (worker.status !== 'offline') {
        const lastHb = new Date(worker.lastHeartbeat).getTime();
        if (now - lastHb > this.workerTimeoutMs) {
          logger.warn(`Worker ${worker.name} (${worker.id}) missed heartbeats. Marking offline.`);
          await workerService.updateWorkerStatus(worker.id, 'offline');

          if (worker.currentJobId) {
            const jobId = worker.currentJobId;
            const job = await queueRepository.getJob(jobId);
            if (job && (job.status === 'rendering' || job.status === 'queued')) {
              const retries = this.jobRetries.get(jobId) || 0;
              if (retries < this.maxRetries) {
                const nextRetry = retries + 1;
                this.jobRetries.set(jobId, nextRetry);

                RenderStateMachine.checkAndTransition(job.status, 'queued');

                job.status = 'queued';
                job.stage = 'validate';
                job.progress = 0;
                job.workerId = undefined;
                job.logs.push(`[${new Date().toISOString()}] Worker went offline. Rescheduling job (Retry ${nextRetry}/${this.maxRetries})`);
                await queueRepository.saveJob(job);
                logger.info(`Rescheduled job ${jobId} due to worker timeout (Attempt ${nextRetry}/${this.maxRetries})`);
              } else {
                try {
                  RenderStateMachine.checkAndTransition(job.status, 'failed');
                } catch {}

                job.status = 'failed';
                job.stage = 'failed';
                job.error = `Worker went offline and max retry limit (${this.maxRetries}) reached.`;
                job.logs.push(`[${new Date().toISOString()}] Worker went offline. Max retries reached. Failing job.`);
                job.completedAt = new Date().toISOString();
                await queueRepository.saveJob(job);
                logger.error(`Failing job ${jobId} due to worker timeout. Max retries reached.`);

                renderEventBus.emit('JobFailed', {
                  jobId,
                  error: 'Worker timeout, max retries reached',
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
        }
      }
    }
  }

  public clearRetries() {
    this.jobRetries.clear();
  }
}

export const renderScheduler = new RenderScheduler();
