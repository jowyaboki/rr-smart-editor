import { Router } from 'express';
import { assetIntelligenceController } from '../asset-intelligence/controllers/AssetIntelligenceController';

const router = Router();

router.post('/search', (req, res) => assetIntelligenceController.search(req, res));
router.post('/cluster', (req, res) => assetIntelligenceController.cluster(req, res));
router.post('/recommendations', (req, res) => assetIntelligenceController.recommendations(req, res));
router.post('/moderate', (req, res) => assetIntelligenceController.moderate(req, res));
router.post('/analyze', (req, res) => assetIntelligenceController.analyzeAndIndex(req, res));

export default router;
