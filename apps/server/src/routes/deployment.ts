import { Router } from 'express';
import { globalDeploymentPlatformEngine, DeploymentMode } from '@ai-video-editor/deployment-core';

const router = Router();

router.post('/bootstrap', async (req, res) => {
  try {
    const { mode } = req.body;
    if (!mode) {
      res.status(400).json({ success: false, error: 'mode parameter is required.' });
      return;
    }
    const bootResult = await globalDeploymentPlatformEngine.deploymentService.bootstrap(mode as DeploymentMode);
    res.json({ success: true, bootResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/health/liveness', async (req, res) => {
  try {
    const probe = await globalDeploymentPlatformEngine.healthService.getLiveness();
    res.json({ success: true, probe });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/health/readiness', async (req, res) => {
  try {
    const report = await globalDeploymentPlatformEngine.healthService.getReadiness();
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/backup/create', async (req, res) => {
  try {
    const { type } = req.body;
    const backup = await globalDeploymentPlatformEngine.backupService.createBackup(type || 'workspace');
    res.json({ success: true, backup });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/license/validate', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      res.status(400).json({ success: false, error: 'license Key parameter is required.' });
      return;
    }
    const info = await globalDeploymentPlatformEngine.licenseService.validateLicense(key);
    res.json({ success: true, license: info });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
