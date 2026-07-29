import { Router } from 'express';
import { securityController } from '../security/controllers/SecurityController';

const router = Router();

// Authentication & Identity
router.post('/auth', (req, res) => securityController.authenticate(req, res));

// Sessions
router.post('/sessions', (req, res) => securityController.createSession(req, res));
router.get('/sessions', (req, res) => securityController.listSessions(req, res));
router.delete('/sessions/:id', (req, res) => securityController.revokeSession(req, res));

// Policies & ABAC Engine
router.post('/policies', (req, res) => securityController.createPolicy(req, res));
router.get('/policies', (req, res) => securityController.listPolicies(req, res));
router.post('/policies/evaluate', (req, res) => securityController.evaluateAccess(req, res));

// Secrets Vault
router.get('/secrets', (req, res) => securityController.listSecrets(req, res));
router.post('/secrets/rotate', (req, res) => securityController.rotateSecret(req, res));

// Compliance reports check
router.post('/compliance/validate', (req, res) => securityController.validateCompliance(req, res));

// Monitoring Alerts
router.get('/monitoring/alerts', (req, res) => securityController.listAlerts(req, res));
router.post('/monitoring/alerts/:id/resolve', (req, res) => securityController.resolveAlert(req, res));

export default router;
