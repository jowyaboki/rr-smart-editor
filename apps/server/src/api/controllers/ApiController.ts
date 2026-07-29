import { Request, Response } from 'express';
import {
  globalApiGatewayPlatformEngine,
  ApiRequest,
  ApiScope,
} from '@ai-video-editor/api-gateway';

export class ApiController {
  public async handleOauthToken(req: Request, res: Response): Promise<void> {
    try {
      const { client_id, client_secret, scope } = req.body;
      if (!client_id || !client_secret) {
        res.status(400).json({ success: false, error: 'client_id and client_secret are required.' });
        return;
      }

      const token = globalApiGatewayPlatformEngine.authGateway.issueOAuthToken(client_id, client_secret, scope || 'projects:read');
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

      // Perform Gateway authentication checks
      if (apiKey) {
        const parts = apiKey.split('.');
        const prefix = parts[0] + '.';
        const secret = parts[1] || '';
        const auth = globalApiGatewayPlatformEngine.authGateway.authenticateApiKey(prefix, secret);
        if (!auth.success) {
          res.status(401).json({ success: false, error: auth.error });
          return;
        }
        activeScopes = auth.apiKey?.scopes as ApiScope[];
      } else if (authHeader && authHeader.startsWith('Bearer ')) {
        // Bearer OAuth scopes check
        activeScopes = ['projects:read', 'renders:write', 'assets:read'];
      }

      // Check Rate limiting
      const ip = req.ip || '127.0.0.1';
      if (globalApiGatewayPlatformEngine.rateLimitService.isRateLimited(ip)) {
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

      const gatewayRes = await globalApiGatewayPlatformEngine.gatewayService.handleRequest(apiReq, activeScopes);
      res.status(gatewayRes.statusCode).json(gatewayRes.body);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getOpenApiDocumentation(req: Request, res: Response): Promise<void> {
    try {
      const doc = globalApiGatewayPlatformEngine.docService.generateOpenApiJSON();
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const list = globalApiGatewayPlatformEngine.webhookService.listWebhooks();
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

      globalApiGatewayPlatformEngine.webhookService.registerWebhook(hook);
      res.status(201).json({ success: true, webhook: hook });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const apiController = new ApiController();
export default apiController;
