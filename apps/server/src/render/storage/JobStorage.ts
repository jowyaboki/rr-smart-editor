import fs from 'fs';
import path from 'path';
import { RenderJob, RenderWorker, RenderArtifact } from '@ai-video-editor/shared';
import { logger } from '../../utils/logger';

export interface JobStorage {
  saveJob(job: RenderJob): Promise<void>;
  getJob(id: string): Promise<RenderJob | undefined>;
  listJobs(filter?: { projectId?: string; status?: string }): Promise<RenderJob[]>;
  deleteJob(id: string): Promise<boolean>;
  saveWorker(worker: RenderWorker): Promise<void>;
  getWorker(id: string): Promise<RenderWorker | undefined>;
  listWorkers(): Promise<RenderWorker[]>;
  deleteWorker(id: string): Promise<boolean>;
  saveArtifact(artifact: RenderArtifact): Promise<void>;
  listArtifacts(): Promise<RenderArtifact[]>;
}

export class FileJobStorage implements JobStorage {
  private filePath: string;
  private data: {
    jobs: Record<string, RenderJob>;
    workers: Record<string, RenderWorker>;
    artifacts: Record<string, RenderArtifact>;
    queueStatus: 'running' | 'paused';
  };

  constructor(customPath?: string) {
    this.filePath = customPath || path.join(__dirname, '../../../../renders_db.json');
    this.data = {
      jobs: {},
      workers: {},
      artifacts: {},
      queueStatus: 'running',
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          jobs: parsed.jobs || {},
          workers: parsed.workers || {},
          artifacts: parsed.artifacts || {},
          queueStatus: parsed.queueStatus || 'running',
        };
        logger.info(`Loaded render database from ${this.filePath}. Active jobs: ${Object.keys(this.data.jobs).length}`);
      } else {
        this.saveSync();
      }
    } catch (err) {
      logger.error(`Failed to load render database from ${this.filePath}`, err);
    }
  }

  private saveSync() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      logger.error(`Failed to write render database to ${this.filePath}`, err);
    }
  }

  public async saveJob(job: RenderJob): Promise<void> {
    this.data.jobs[job.id] = { ...job, updatedAt: new Date().toISOString() };
    this.saveSync();
  }

  public async getJob(id: string): Promise<RenderJob | undefined> {
    return this.data.jobs[id];
  }

  public async listJobs(filter?: { projectId?: string; status?: string }): Promise<RenderJob[]> {
    let list = Object.values(this.data.jobs);
    if (filter) {
      if (filter.projectId) {
        list = list.filter((j) => j.projectId === filter.projectId);
      }
      if (filter.status) {
        list = list.filter((j) => j.status === filter.status);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async deleteJob(id: string): Promise<boolean> {
    if (this.data.jobs[id]) {
      delete this.data.jobs[id];
      this.saveSync();
      return true;
    }
    return false;
  }

  public async saveWorker(worker: RenderWorker): Promise<void> {
    this.data.workers[worker.id] = { ...worker };
    this.saveSync();
  }

  public async getWorker(id: string): Promise<RenderWorker | undefined> {
    return this.data.workers[id];
  }

  public async listWorkers(): Promise<RenderWorker[]> {
    return Object.values(this.data.workers);
  }

  public async deleteWorker(id: string): Promise<boolean> {
    if (this.data.workers[id]) {
      delete this.data.workers[id];
      this.saveSync();
      return true;
    }
    return false;
  }

  public async saveArtifact(artifact: RenderArtifact): Promise<void> {
    this.data.artifacts[artifact.id] = { ...artifact };
    this.saveSync();
  }

  public async listArtifacts(): Promise<RenderArtifact[]> {
    return Object.values(this.data.artifacts).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  public getQueueStatus(): 'running' | 'paused' {
    return this.data.queueStatus;
  }

  public setQueueStatus(status: 'running' | 'paused') {
    this.data.queueStatus = status;
    this.saveSync();
  }

  public clear() {
    this.data = {
      jobs: {},
      workers: {},
      artifacts: {},
      queueStatus: 'running',
    };
    this.saveSync();
  }
}

export const jobStorage = new FileJobStorage();
