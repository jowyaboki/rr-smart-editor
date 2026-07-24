import { Request, Response } from 'express';
import { globalBrandPlatformEngine, BrandKit } from '@ai-video-editor/brand-platform';

const serverBrandKits: BrandKit[] = [];

export class BrandController {

  public async registerBrandKit(req: Request, res: Response): Promise<void> {
    try {
      const kit = req.body;
      if (!kit.id || !kit.name) {
        res.status(400).json({ success: false, error: 'Brand kit id and name are required.' });
        return;
      }
      globalBrandPlatformEngine.brandService.registerBrandKit(kit);
      serverBrandKits.push(kit);
      res.json({ success: true, message: `Brand kit '${kit.name}' registered successfully.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getActiveBrandKit(req: Request, res: Response): Promise<void> {
    try {
      const kit = globalBrandPlatformEngine.brandService.getActiveBrandKit();
      if (kit) {
        res.json({ success: true, brandKit: kit });
      } else {
        res.status(404).json({ success: false, error: 'No active brand kit found.' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async validateProjectCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { project, brandKitId } = req.body;
      const kit = brandKitId
        ? globalBrandPlatformEngine.brandService.getBrandKit(brandKitId)
        : globalBrandPlatformEngine.brandService.getActiveBrandKit();

      if (!kit) {
        res.status(400).json({ success: false, error: 'Valid brand kit is required for compliance validation.' });
        return;
      }

      const score = await globalBrandPlatformEngine.validationService.validateProject(project, kit);
      globalBrandPlatformEngine.analyticsService.logAudit(project.id || 'job_dummy', score);

      res.json({ success: true, complianceReport: score });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createVersionSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { version, brandKit, author, changelog } = req.body;
      if (!version || !brandKit) {
        res.status(400).json({ success: false, error: 'version and brandKit are required.' });
        return;
      }
      const snapshot = globalBrandPlatformEngine.versionService.createVersion(version, brandKit, author || 'Admin', changelog);
      res.json({ success: true, snapshot });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listVersionSnapshots(req: Request, res: Response): Promise<void> {
    try {
      const history = globalBrandPlatformEngine.versionService.listVersions();
      res.json({ success: true, history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const brandController = new BrandController();
