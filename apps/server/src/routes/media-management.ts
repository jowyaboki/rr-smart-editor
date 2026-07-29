import { Router } from 'express';
import { mediaManagementController } from '../media-management/controllers/MediaManagementController';

const router = Router();

// Asset routes
router.get('/assets', (req, res) => mediaManagementController.listAssets(req, res));
router.get('/assets/:id', (req, res) => mediaManagementController.getAsset(req, res));
router.post('/assets', (req, res) => mediaManagementController.ingestAsset(req, res));
router.post('/assets/:id/versions', (req, res) => mediaManagementController.createVersion(req, res));
router.post('/assets/:id/versions/:versionNumber/restore', (req, res) => mediaManagementController.restoreVersion(req, res));

// Rights & Clearance routes
router.post('/assets/:id/rights', (req, res) => mediaManagementController.assignRights(req, res));
router.get('/assets/:id/rights/validate', (req, res) => mediaManagementController.validateRights(req, res));

// Approvals & workflows routes
router.post('/approvals', (req, res) => mediaManagementController.submitApproval(req, res));
router.post('/approvals/:id/vote', (req, res) => mediaManagementController.voteApproval(req, res));

// Storage lifecycle routes
router.post('/assets/:id/tier', (req, res) => mediaManagementController.transitionTier(req, res));

// Folder routes
router.get('/folders', (req, res) => mediaManagementController.listFolders(req, res));
router.post('/folders', (req, res) => mediaManagementController.createFolder(req, res));

// Collections routes
router.get('/collections', (req, res) => mediaManagementController.listCollections(req, res));
router.post('/collections', (req, res) => mediaManagementController.createCollection(req, res));

export default router;
