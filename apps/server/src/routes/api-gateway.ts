import { Router } from 'express';
import { apiController } from '../api/controllers/ApiController';

const router = Router();

// OAuth Credentials
router.post('/auth/token', (req, res) => apiController.handleOauthToken(req, res));

// OpenAPI schema
router.get('/documentation/openapi', (req, res) => apiController.getOpenApiDocumentation(req, res));

// Webhooks Registry
router.get('/webhooks', (req, res) => apiController.listWebhooks(req, res));
router.post('/webhooks', (req, res) => apiController.registerWebhook(req, res));

// Catch-all Gateway router matching versionedREST endpoints
router.all('/v1/*', (req, res) => apiController.handleGatewayRoute(req, res));

export default router;
