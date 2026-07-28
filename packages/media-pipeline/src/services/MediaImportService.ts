import { MediaAsset, ImportJob, JobStatus } from '../types';

export class MediaImportService {
  private static registeredAssets = new Map<string, MediaAsset>(); // key: fingerprint hash -> MediaAsset
  private static jobs: Record<string, ImportJob> = {};

  /**
   * Generates a deterministic fingerprint hash representing the asset.
   * Prevents duplicates before writing or transcoding!
   */
  public static generateFingerprint(filename: string, size: number): string {
    const raw = `${filename}_${size}`;
    // Simple but highly collision-free checksum hash generator
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash)}`;
  }

  /**
   * Create background import job for file ingest.
   */
  public static createImportJob(filename: string, size: number, path: string): ImportJob {
    const fingerprint = this.generateFingerprint(filename, size);

    // Check if asset already exists in our index (Duplicate Detection)
    const existing = this.registeredAssets.get(fingerprint);
    if (existing) {
      throw new Error(`Duplicate asset detected. Asset "${filename}" already imported with ID "${existing.id}".`);
    }

    const id = `job_${Date.now()}_${Math.floor(Math.random() * 100)}`;
    const assetId = `asset_${Date.now()}_${Math.floor(Math.random() * 100)}`;

    const job: ImportJob = {
      id,
      assetId,
      filename,
      status: 'queued',
      progress: 0,
      retries: 0,
    };

    this.jobs[id] = job;
    return job;
  }

  /**
   * Control action: Update job status and progress ratios.
   */
  public static updateJob(jobId: string, status: JobStatus, progress: number, error?: string): ImportJob {
    const job = this.jobs[jobId];
    if (!job) throw new Error(`Job "${jobId}" not found.`);

    job.status = status;
    job.progress = Math.min(100, Math.max(0, progress));
    if (error) job.error = error;

    return job;
  }

  /**
   * Register a successfully ingested asset.
   */
  public static registerAsset(asset: MediaAsset): void {
    this.registeredAssets.set(asset.fingerprint, asset);
  }

  public static getAssetByFingerprint(hash: string): MediaAsset | undefined {
    return this.registeredAssets.get(hash);
  }

  public static getJob(id: string): ImportJob | undefined {
    return this.jobs[id];
  }

  public static clear(): void {
    this.registeredAssets.clear();
    this.jobs = {};
  }
}
