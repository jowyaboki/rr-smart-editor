import { Request, Response } from 'express';
import { globalDeliveryPlatformEngine, ExportPreset } from '@ai-video-editor/delivery-platform';
import { RenderArtifact } from '@ai-video-editor/shared';

export class DeliveryController {
  public async submitJob(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, renderArtifact, presetId, scheduleType, options } = req.body;

      if (!projectId || !presetId) {
        res.status(400).json({ success: false, error: 'projectId and presetId are required.' });
        return;
      }

      // Check for valid preset
      const preset = globalDeliveryPlatformEngine.presetService.getPreset(presetId);
      if (!preset) {
        res.status(404).json({ success: false, error: `ExportPreset '${presetId}' not found.` });
        return;
      }

      // Mock/Construct a default RenderArtifact if none provided (for development/demo purposes)
      const artifact: RenderArtifact = renderArtifact || {
        id: `art_${Math.random().toString(36).substr(2, 9)}`,
        jobId: `render_job_${Math.random().toString(36).substr(2, 9)}`,
        url: `/uploads/renders/default_render.mp4`,
        format: 'mp4',
        size: 1024 * 1024 * 15,
        metadata: {
          duration: 30,
          resolution: { width: 1920, height: 1080 },
          codec: 'h264',
        },
        createdAt: new Date().toISOString(),
      };

      const job = await globalDeliveryPlatformEngine.deliveryService.submitJob(
        projectId,
        artifact,
        presetId,
        scheduleType || 'immediate',
        options
      );

      res.status(201).json({ success: true, job });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = globalDeliveryPlatformEngine.deliveryService.getJob(jobId);

      if (!job) {
        res.status(404).json({ success: false, error: `DeliveryJob '${jobId}' not found.` });
        return;
      }

      res.json({ success: true, job });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getJobResult(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const result = globalDeliveryPlatformEngine.deliveryService.getResult(jobId);

      if (!result) {
        res.status(404).json({ success: false, error: `DeliveryResult for job '${jobId}' not found.` });
        return;
      }

      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const jobs = globalDeliveryPlatformEngine.deliveryService.listJobs(projectId as string);
      res.json({ success: true, jobs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listPresets(req: Request, res: Response): Promise<void> {
    try {
      const presets = globalDeliveryPlatformEngine.presetService.listPresets();
      res.json({ success: true, presets });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createPreset(req: Request, res: Response): Promise<void> {
    try {
      const preset: ExportPreset = req.body;
      if (!preset.id || !preset.name || !preset.format || !preset.encodingProfile) {
        res.status(400).json({ success: false, error: 'id, name, format, and encodingProfile are required.' });
        return;
      }

      globalDeliveryPlatformEngine.presetService.registerPreset(preset);
      res.status(201).json({ success: true, preset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async cancelJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = globalDeliveryPlatformEngine.deliveryService.getJob(jobId);

      if (!job) {
        res.status(404).json({ success: false, error: `DeliveryJob '${jobId}' not found.` });
        return;
      }

      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        res.status(400).json({ success: false, error: `Cannot cancel job in state: ${job.status}` });
        return;
      }

      job.status = 'cancelled';
      job.updatedAt = new Date().toISOString();
      res.json({ success: true, message: `DeliveryJob '${jobId}' was cancelled successfully.`, job });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const deliveryController = new DeliveryController();
