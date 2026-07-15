import { RenderWorker, WorkerCapability } from '@ai-video-editor/shared';
import { jobStorage } from '../storage/JobStorage';
import { logger } from '../../utils/logger';

export class WorkerService {
  public async registerWorker(params: {
    id: string;
    name: string;
    capabilities: WorkerCapability;
    status?: 'idle' | 'busy' | 'offline';
  }): Promise<RenderWorker> {
    const existing = await jobStorage.getWorker(params.id);
    const worker: RenderWorker = {
      id: params.id,
      name: params.name,
      status: params.status || existing?.status || 'idle',
      capabilities: params.capabilities,
      lastHeartbeat: new Date().toISOString(),
      currentJobId: params.status === 'busy' ? existing?.currentJobId : undefined,
    };
    await jobStorage.saveWorker(worker);
    logger.info(`Worker registered: ${params.name} (${params.id})`);
    return worker;
  }

  public async recordHeartbeat(
    id: string,
    systemInfo?: RenderWorker['systemInfo'],
    currentJobId?: string,
  ): Promise<boolean> {
    const worker = await jobStorage.getWorker(id);
    if (!worker) return false;

    worker.lastHeartbeat = new Date().toISOString();
    if (systemInfo) {
      worker.systemInfo = systemInfo;
    }
    if (currentJobId) {
      worker.currentJobId = currentJobId;
      worker.status = 'busy';
    } else if (worker.status === 'busy' && !currentJobId) {
      worker.status = 'idle';
      worker.currentJobId = undefined;
    }
    await jobStorage.saveWorker(worker);
    return true;
  }

  public async updateWorkerStatus(
    id: string,
    status: 'idle' | 'busy' | 'offline',
    currentJobId?: string,
  ): Promise<boolean> {
    const worker = await jobStorage.getWorker(id);
    if (!worker) return false;

    worker.status = status;
    worker.currentJobId = currentJobId;
    await jobStorage.saveWorker(worker);
    return true;
  }

  public async listWorkers(): Promise<RenderWorker[]> {
    return jobStorage.listWorkers();
  }

  public async getWorker(id: string): Promise<RenderWorker | undefined> {
    return jobStorage.getWorker(id);
  }

  public async deleteWorker(id: string): Promise<boolean> {
    return jobStorage.deleteWorker(id);
  }
}

export const workerService = new WorkerService();
