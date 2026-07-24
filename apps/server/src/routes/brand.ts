import { Router } from 'express';
import { brandController } from '../brand/controllers/BrandController';

const router = Router();

router.post('/kits/register', (req, res) => brandController.registerBrandKit(req, res));
router.get('/kits/active', (req, res) => brandController.getActiveBrandKit(req, res));
router.post('/validate', (req, res) => brandController.validateProjectCompliance(req, res));
router.post('/versions/create', (req, res) => brandController.createVersionSnapshot(req, res));
router.get('/versions/list', (req, res) => brandController.listVersionSnapshots(req, res));

export default router;
