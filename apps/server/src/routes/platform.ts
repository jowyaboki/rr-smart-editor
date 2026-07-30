import { Router } from 'express';
import { platformController } from '../platform/controllers/PlatformController';

const router = Router();

router.get('/modules', (req, res) => platformController.getModules(req, res));
router.get('/services', (req, res) => platformController.getServices(req, res));
router.get('/health', (req, res) => platformController.getHealth(req, res));
router.get('/diagnostics', (req, res) => platformController.getDiagnostics(req, res));
router.post('/restart', (req, res) => platformController.triggerRestart(req, res));

export default router;
