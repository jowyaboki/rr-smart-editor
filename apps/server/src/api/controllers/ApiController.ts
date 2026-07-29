import { Request, Response } from 'express';
import {
  globalApiPlatformEngine,
  ApiRequest,
  ApiScope,
} from '@ai-video-editor/api-platform';
import { globalOpenApiService } from '@ai-video-editor/openapi';

export class ApiController {
  public async handleOauthToken(req: Request, res: Response): Promise<void> {
    try {
      const { client_id, client_secret, scope } = req.body;
      if (!client_id || !client_secret) {
        res.status(400).json({ success: false, error: 'client_id and client_secret are required.' });
        return;
      }

      // Mock Token Issuance
      const token = {
        accessToken: `token_${Math.random().toString(36).substr(2, 12)}`,
        tokenType: 'Bearer' as const,
        expiresIn: 3600,
        scope: scope || 'projects:read',
      };
      res.json(token);
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  }

  public async handleGatewayRoute(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      const authHeader = req.headers['authorization'] as string;

      let activeScopes: ApiScope[] = ['projects:read'];

      if (apiKey) {
        activeScopes = ['projects:read', 'renders:write', 'assets:read'];
      } else if (authHeader && authHeader.startsWith('Bearer ')) {
        activeScopes = ['projects:read', 'renders:write', 'assets:read'];
      }

      // Check Rate limiting
      const ip = req.ip || '127.0.0.1';
      if (globalApiPlatformEngine.rateLimitService.isRateLimited(ip)) {
        res.status(429).json({ success: false, error: 'Too Many Requests. Rate limit exceeded.' });
        return;
      }

      // Invoke Gateway service
      const apiReq: ApiRequest = {
        id: `req_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: ip,
        path: req.path,
        method: req.method as any,
        apiVersion: 'v1',
        headers: req.headers as Record<string, string>,
        bodySize: JSON.stringify(req.body).length,
      };

      const gatewayRes = await globalApiPlatformEngine.gatewayService.handleRequest(apiReq, activeScopes);
      res.status(gatewayRes.statusCode).json(gatewayRes.body);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getOpenApiDocumentation(req: Request, res: Response): Promise<void> {
    try {
      const doc = globalOpenApiService.generateOpenApi31Spec();
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const list = globalApiPlatformEngine.webhookService.listWebhooks();
      res.json({ success: true, webhooks: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async registerWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { url, secret, subscribedEvents } = req.body;
      if (!url || !secret) {
        res.status(400).json({ success: false, error: 'url and secret are required.' });
        return;
      }

      const hook = {
        id: `hook_${Math.random().toString(36).substr(2, 9)}`,
        applicationId: 'app_dashboard_default',
        url,
        secret,
        subscribedEvents: subscribedEvents || ['*'],
        isActive: true,
      };

      globalApiPlatformEngine.webhookService.registerWebhook(hook);
      res.status(201).json({ success: true, webhook: hook });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const apiController = new ApiController();
export default apiController;
