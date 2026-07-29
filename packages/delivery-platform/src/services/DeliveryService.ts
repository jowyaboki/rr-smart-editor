import { RenderArtifact } from '@ai-video-editor/shared';
import {
  DeliveryJob,
  ExportPreset,
  DeliveryManifest,
  QualityReport,
  MediaPackage,
  DistributionTask,
  DeliveryResult,
} from '../types';
import { globalPresetService } from './PresetService';
import { globalValidationService } from './ValidationService';
import { globalExportService } from './ExportService';
import { globalEncodingService } from './EncodingService';
import { globalPackagingService } from './PackagingService';
import { globalDistributionService } from './DistributionService';

export class DeliveryService {
  private activeJobs: Map<string, DeliveryJob> = new Map();
  private finishedResults: Map<string, DeliveryResult> = new Map();

  public async submitJob(
    projectId: string,
    renderArtifact: RenderArtifact,
    presetId: string,
    scheduleType: 'immediate' | 'scheduled' | 'recurring' | 'conditional' | 'workflow' = 'immediate',
    options?: {
      scheduledTime?: string;
      recurrenceCron?: string;
      conditions?: Array<{ field: string; operator: 'equals' | 'contains' | 'gt' | 'lt'; value: string }>;
      workflowTriggerId?: string;
    }
  ): Promise<DeliveryJob> {
    const preset = globalPresetService.getPreset(presetId);
    if (!preset) {
      throw new Error(`ExportPreset '${presetId}' not found`);
    }

    const jobId = `del_job_${Math.random().toString(36).substr(2, 9)}`;

    const distributionTasks: DistributionTask[] = preset.destinations.map((dest) => ({
      id: `task_${Math.random().toString(36).substr(2, 9)}`,
      jobId,
      destinationId: dest.id,
      status: 'queued',
      progress: 0,
      retryCount: 0,
    }));

    const job: DeliveryJob = {
      id: jobId,
      projectId,
      renderArtifactId: renderArtifact.id,
      presetId,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      distributionTasks,
      schedule: {
        type: scheduleType,
        scheduledTime: options?.scheduledTime,
        recurrenceCron: options?.recurrenceCron,
        conditions: options?.conditions,
        workflowTriggerId: options?.workflowTriggerId,
      },
    };

    this.activeJobs.set(jobId, job);

    // If immediate, process asynchronously
    if (scheduleType === 'immediate') {
      this.executeJob(job, renderArtifact, preset).catch((err) => {
        console.error(`DeliveryJob ${jobId} failed to execute:`, err);
      });
    }

    return job;
  }

  public async executeJob(job: DeliveryJob, artifact: RenderArtifact, preset: ExportPreset): Promise<DeliveryResult> {
    job.status = 'processing';
    job.updatedAt = new Date().toISOString();

    try {
      // 1. Run Automated Quality Control Validation
      job.progress = 10;
      const qcReport = await globalValidationService.validate(artifact, preset.qcRules || []);
      job.qualityReport = qcReport;
      job.updatedAt = new Date().toISOString();

      if (!qcReport.isValid) {
        throw new Error(`QC check failed with score ${qcReport.score}. Blocked distribution.`);
      }

      // 2. Perform Exporter actions if applicable (e.g. archiving, image sequences, etc.)
      job.progress = 30;
      let workingFilePath = artifact.url;
      let workingSize = artifact.size;

      if (preset.format !== artifact.format) {
        const expResult = await globalExportService.export(artifact, preset.format);
        workingFilePath = expResult.outputPath;
        workingSize = expResult.size;
      }

      // 3. Perform Video/Audio Re-encoding Optimization if needed
      job.progress = 50;
      const profile = preset.encodingProfile;
      // Re-encode if codec differs or custom settings apply
      if (profile.videoCodec && profile.videoCodec !== artifact.metadata.codec) {
        const encResult = await globalEncodingService.encode(workingFilePath, profile);
        workingFilePath = encResult.outputPath;
        workingSize = encResult.size;
      }

      // 4. Perform Packaging (e.g. HLS, MPEG-DASH streaming chunks or bundling)
      job.progress = 70;
      let finalPackage: MediaPackage;
      if (preset.packagingProfile) {
        finalPackage = await globalPackagingService.package(workingFilePath, preset.packagingProfile);
      } else {
        // Wrap plain file as single-file MediaPackage
        finalPackage = {
          id: `pkg_${Math.random().toString(36).substr(2, 9)}`,
          manifestId: `manifest_${job.id}`,
          format: preset.format,
          files: [{ path: workingFilePath, size: workingSize, checksum: 'flat_file_sum' }],
          createdAt: new Date().toISOString(),
        };
      }

      const manifest: DeliveryManifest = {
        id: `manifest_${job.id}`,
        jobId: job.id,
        mediaPackages: [finalPackage],
        metadata: {
          presetName: preset.name,
          format: preset.format,
          qcScore: qcReport.score,
          artifactUrl: artifact.url,
        },
        createdAt: new Date().toISOString(),
      };

      job.manifest = manifest;
      job.progress = 80;
      job.updatedAt = new Date().toISOString();

      // 5. Distribute Packages to configured destinations in parallel
      const uploadPromises = preset.destinations.map(async (dest) => {
        const task = job.distributionTasks.find((t) => t.destinationId === dest.id);
        if (task) {
          task.status = 'uploading';
        }

        const res = await globalDistributionService.deliver(finalPackage, dest, (t) => {
          // Update live distribution task metrics
          if (task) {
            task.status = t.status;
            task.progress = t.progress;
            task.error = t.error;
            task.retryCount = t.retryCount;
            task.bandwidthBytesPerSec = t.bandwidthBytesPerSec;
            task.etaSeconds = t.etaSeconds;
          }
          // Recalculate global job progress
          this.recalculateJobProgress(job);
        });

        if (!res.success) {
          throw new Error(`Destination ${dest.name} delivery failed: ${res.error}`);
        }

        return res.url;
      });

      const urls = await Promise.all(uploadPromises);

      // Complete job successfully
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.updatedAt = new Date().toISOString();

      const result: DeliveryResult = {
        id: `res_${job.id}`,
        jobId: job.id,
        status: 'success',
        manifestUrl: urls[0],
        qualityScore: qcReport.score,
        completedAt: new Date().toISOString(),
      };

      this.finishedResults.set(job.id, result);
      return result;
    } catch (err: any) {
      job.status = 'failed';
      job.error = err.message;
      job.updatedAt = new Date().toISOString();

      const result: DeliveryResult = {
        id: `res_${job.id}`,
        jobId: job.id,
        status: 'failure',
        errors: [err.message],
        completedAt: new Date().toISOString(),
      };

      this.finishedResults.set(job.id, result);
      return result;
    }
  }

  private recalculateJobProgress(job: DeliveryJob): void {
    if (job.status !== 'processing') return;

    // Base progress before distribution starts is 80%
    const baseProgress = 80;
    const distributionWeight = 20;

    if (job.distributionTasks.length === 0) {
      job.progress = baseProgress + distributionWeight;
      return;
    }

    const totalProgressSum = job.distributionTasks.reduce((sum, t) => sum + t.progress, 0);
    const averageProgress = totalProgressSum / job.distributionTasks.length;

    job.progress = Math.round(baseProgress + (averageProgress * distributionWeight) / 100);
  }

  public getJob(id: string): DeliveryJob | undefined {
    return this.activeJobs.get(id);
  }

  public getResult(jobId: string): DeliveryResult | undefined {
    return this.finishedResults.get(jobId);
  }

  public listJobs(projectId?: string): DeliveryJob[] {
    const list = Array.from(this.activeJobs.values());
    if (projectId) {
      return list.filter((job) => job.projectId === projectId);
    }
    return list;
  }
}

export const globalDeliveryService = new DeliveryService();
