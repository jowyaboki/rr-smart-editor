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
  private tempPath: string;
  private data: {
    jobs: Record<string, RenderJob>;
    workers: Record<string, RenderWorker>;
    artifacts: Record<string, RenderArtifact>;
    queueStatus: 'running' | 'paused';
  };

  // Asynchronous Debounced Write Queue States
  private flushTimeout: NodeJS.Timeout | null = null;
  private flushIntervalMs = 50; // Configurable flush interval (50ms)
  private isWriting = false;
  private hasPendingChanges = false;

  constructor(customPath?: string) {
    this.filePath = customPath || path.join(__dirname, '../../../../renders_db.json');
    this.tempPath = `${this.filePath}.tmp`;
    this.data = {
      jobs: {},
      workers: {},
      artifacts: {},
      queueStatus: 'running',
    };
    this.load();
    this.setupGracefulShutdown();
  }

  /**
   * Load data with built-in crash recovery: if main file is missing or corrupt, load from temp file.
   */
  private load() {
    const tryParse = (file: string): boolean => {
      try {
        if (fs.existsSync(file)) {
          const raw = fs.readFileSync(file, 'utf8');
          const parsed = JSON.parse(raw);
          this.data = {
            jobs: parsed.jobs || {},
            workers: parsed.workers || {},
            artifacts: parsed.artifacts || {},
            queueStatus: parsed.queueStatus || 'running',
          };
          logger.info(`Loaded render database from ${file}. Active jobs: ${Object.keys(this.data.jobs).length}`);
          return true;
        }
      } catch (err) {
        logger.error(`Failed to parse render database from ${file}:`, err);
      }
      return false;
    };

    // 1. Try loading from main database file
    if (tryParse(this.filePath)) return;

    // 2. Crash Recovery: try loading from temp database file
    logger.warn(`Main database file corrupt or missing. Attempting crash recovery from temp path: ${this.tempPath}`);
    if (tryParse(this.tempPath)) {
      logger.info('Crash recovery successful! Restored database from temp file.');
      return;
    }

    // 3. Fallback to fresh database
    this.saveSync();
  }

  /**
   * Asynchronous, Non-blocking, Atomic write operation with temp-swap.
   */
  private async writeAtomicAsync(): Promise<void> {
    if (this.isWriting) {
      this.hasPendingChanges = true;
      return;
    }

    this.isWriting = true;
    this.hasPendingChanges = false;

    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }

      const payload = JSON.stringify(this.data, null, 2);

      // Write atomically to temporary file
      await fs.promises.writeFile(this.tempPath, payload, 'utf8');

      // Atomic rename swap (very fast and crash-proof)
      await fs.promises.rename(this.tempPath, this.filePath);
    } catch (err) {
      logger.error('Failed async atomic write for render database:', err);
    } finally {
      this.isWriting = false;
      // If changes occurred during write, trigger immediate flush
      if (this.hasPendingChanges) {
        this.scheduleFlush();
      }
    }
  }

  /**
   * Synchronous fallback for blocking writes and shutdowns.
   */
  private saveSync() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(this.tempPath, this.filePath);
    } catch (err) {
      logger.error(`Failed synchronous write to ${this.filePath}`, err);
    }
  }

  /**
   * Schedules a debounced database flush to batch writes.
   */
  private scheduleFlush() {
    this.hasPendingChanges = true;
    if (this.flushTimeout) return;

    this.flushTimeout = setTimeout(() => {
      this.flushTimeout = null;
      this.writeAtomicAsync();
    }, this.flushIntervalMs);
  }

  /**
   * Force immediate flush of pending changes (e.g. on shutdown).
   */
  public flushSync(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    this.saveSync();
    this.hasPendingChanges = false;
  }

  private setupGracefulShutdown() {
    const handleShutdown = () => {
      logger.info('Graceful shutdown detected. Flushing pending database changes synchronously...');
      this.flushSync();
    };

    process.once('SIGINT', handleShutdown);
    process.once('SIGTERM', handleShutdown);
    process.once('exit', handleShutdown);
  }

  public async saveJob(job: RenderJob): Promise<void> {
    this.data.jobs[job.id] = { ...job, updatedAt: new Date().toISOString() };
    this.scheduleFlush();
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
      this.scheduleFlush();
      return true;
    }
    return false;
  }

  public async saveWorker(worker: RenderWorker): Promise<void> {
    this.data.workers[worker.id] = { ...worker };
    this.scheduleFlush();
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
      this.scheduleFlush();
      return true;
    }
    return false;
  }

  public async saveArtifact(artifact: RenderArtifact): Promise<void> {
    this.data.artifacts[artifact.id] = { ...artifact };
    this.scheduleFlush();
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
    this.scheduleFlush();
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
