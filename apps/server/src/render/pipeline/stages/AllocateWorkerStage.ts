import { PipelineStage, PipelineContext } from '@ai-video-editor/render-core';
import { RenderStateMachine } from '../../services/RenderStateMachine';
import { renderEventBus } from '../../services/RenderEventSystem';
import { WorkerAllocationError } from '../types/errors';

export class AllocateWorkerStage implements PipelineStage {
  public readonly id = 'allocate_worker';
  public readonly order = 40;

  public async execute(context: PipelineContext): Promise<void> {
    const { job, sharedServices, worker } = context;
    const { jobStorage, workerService } = sharedServices;

    const workerId = worker?.id || 'local-worker-1';

    const freshJob = await jobStorage.getJob(job.id);
    if (!freshJob || freshJob.status === 'cancelled') {
      throw new WorkerAllocationError('Job was cancelled or not found');
    }

    RenderStateMachine.checkAndTransition(freshJob.status, 'rendering');

    freshJob.status = 'rendering';
    freshJob.startedAt = freshJob.startedAt || new Date().toISOString();
    freshJob.workerId = workerId;
    freshJob.logs.push(`[${new Date().toISOString()}] [Stage: ALLOCATE_WORKER] Allocating worker ${workerId}...`);
    await jobStorage.saveJob(freshJob);
    context.job = freshJob;

    renderEventBus.emit('RenderStarted', {
      jobId: job.id,
      workerId,
      timestamp: new Date().toISOString(),
    });

    await workerService.updateWorkerStatus(workerId, 'busy', job.id);
  }

  public async rollback(context: PipelineContext): Promise<void> {
    const { job, sharedServices, worker } = context;
    const { workerService } = sharedServices;
    const workerId = worker?.id || 'local-worker-1';
    await workerService.updateWorkerStatus(workerId, 'idle');
  }
}
