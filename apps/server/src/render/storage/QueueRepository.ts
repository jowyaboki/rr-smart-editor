import { RenderJob, RenderStatus } from '@ai-video-editor/shared';
import { JobStorage, jobStorage } from './JobStorage';

export interface QueueRepository {
  getJob(id: string): Promise<RenderJob | undefined>;
  saveJob(job: RenderJob): Promise<void>;
  updateJobStatus(id: string, status: RenderStatus, error?: string): Promise<void>;
  listJobs(filter?: { projectId?: string; status?: string }): Promise<RenderJob[]>;
  deleteJob(id: string): Promise<boolean>;
  getQueueStatus(): Promise<'running' | 'paused'>;
  setQueueStatus(status: 'running' | 'paused'): Promise<void>;
}

export class FileQueueRepository implements QueueRepository {
  private storage: JobStorage;

  constructor(storage: JobStorage = jobStorage) {
    this.storage = storage;
  }

  public async getJob(id: string): Promise<RenderJob | undefined> {
    return this.storage.getJob(id);
  }

  public async saveJob(job: RenderJob): Promise<void> {
    await this.storage.saveJob(job);
  }

  public async updateJobStatus(id: string, status: RenderStatus, error?: string): Promise<void> {
    const job = await this.storage.getJob(id);
    if (job) {
      job.status = status;
      if (error) {
        job.error = error;
      }
      job.updatedAt = new Date().toISOString();
      await this.storage.saveJob(job);
    }
  }

  public async listJobs(filter?: { projectId?: string; status?: string }): Promise<RenderJob[]> {
    return this.storage.listJobs(filter);
  }

  public async deleteJob(id: string): Promise<boolean> {
    return this.storage.deleteJob(id);
  }

  public async getQueueStatus(): Promise<'running' | 'paused'> {
    if ('getQueueStatus' in this.storage) {
      return (this.storage as any).getQueueStatus();
    }
    return 'running';
  }

  public async setQueueStatus(status: 'running' | 'paused'): Promise<void> {
    if ('setQueueStatus' in this.storage) {
      (this.storage as any).setQueueStatus(status);
    }
  }
}

export const queueRepository: QueueRepository = new FileQueueRepository();
