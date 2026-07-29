import { Router } from 'express';
import { deliveryController } from '../delivery/controllers/DeliveryController';

const router = Router();

router.post('/jobs', (req, res) => deliveryController.submitJob(req, res));
router.get('/jobs', (req, res) => deliveryController.listJobs(req, res));
router.get('/jobs/:jobId', (req, res) => deliveryController.getJob(req, res));
router.get('/jobs/:jobId/result', (req, res) => deliveryController.getJobResult(req, res));
router.post('/jobs/:jobId/cancel', (req, res) => deliveryController.cancelJob(req, res));
router.get('/presets', (req, res) => deliveryController.listPresets(req, res));
router.post('/presets', (req, res) => deliveryController.createPreset(req, res));

export default router;
