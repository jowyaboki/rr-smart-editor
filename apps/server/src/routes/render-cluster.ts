import { Router } from 'express';
import { renderClusterController } from '../render-cluster/controllers/RenderClusterController';

const router = Router();

router.post('/nodes/register', (req, res) => renderClusterController.registerNode(req, res));
router.post('/nodes/heartbeat', (req, res) => renderClusterController.recordHeartbeat(req, res));
router.post('/shards/split', (req, res) => renderClusterController.splitJobIntoShards(req, res));
router.post('/shards/update-progress', (req, res) => renderClusterController.updateShardProgress(req, res));
router.get('/metrics', (req, res) => renderClusterController.getClusterMetrics(req, res));
router.post('/scale', (req, res) => renderClusterController.evaluateAutoScaling(req, res));

export default router;
