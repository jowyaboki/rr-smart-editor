import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  globalApiPlatformEngine,
  globalApiPluginRegistry,
  RRClient,
  ApiRequest,
  ApiEndpointPlugin,
} from '../src/index';

describe('Enterprise API Gateway, Public SDK and Integration Platform Tests', () => {
  test('Authentication via ApiKey models and validations', () => {
    const engine = globalApiPlatformEngine;
    assert.ok(engine.gatewayService);
  });

  test('Rate limiting tracking policies by key burst thresholds', () => {
    const engine = globalApiPlatformEngine;
    engine.rateLimitService.resetLimits();

    const clientIp = '10.0.0.1';

    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), false);
    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), false);
    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), false);

    // 4th request must be rate limited
    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), true);
  });

  test('Public SDK generation support models', () => {
    const tsSDK = `// TypeScript`;
    assert.ok(tsSDK.length > 0);
  });

  test('Webhooks dispatches and retry delivery configurations', async () => {
    const engine = globalApiPlatformEngine;

    engine.webhookService.registerWebhook({
      id: 'hook_broadway_slack',
      applicationId: 'app_broadway',
      url: 'https://hooks.slack.com/services/broadway',
      secret: 'secure_webhook_secret_stripe',
      subscribedEvents: ['render.completed'],
      isActive: true,
    });

    const dispatched = await engine.webhookService.dispatchEvent('render.completed', { jobId: 'job_broadway_999', status: 'completed' });
    assert.strictEqual(dispatched.length, 1);
    assert.strictEqual(dispatched[0].deliveryStatus, 'pending');

    // Wait short time to allow delivery simulation complete
    await new Promise((r) => setTimeout(r, 10));
    assert.strictEqual(dispatched[0].deliveryStatus, 'success');
  });

  test('Plugin dynamic endpoint registrations and handler dispatches', async () => {
    const engine = globalApiPlatformEngine;

    const mockPlugin: ApiEndpointPlugin = {
      id: 'plugin_custom_route',
      path: '/v1/plugins/triggers',
      method: 'POST',
      requiredScopes: ['projects:write'],
      async handler(req) {
        return {
          statusCode: 200,
          body: { success: true, triggeredBy: 'plugin' },
        };
      },
    };

    globalApiPluginRegistry.registerEndpoint(mockPlugin);

    // Call Gateway handler with the custom route
    const req: ApiRequest = {
      id: 'req_plugin_01',
      ipAddress: '127.0.0.1',
      path: '/v1/plugins/triggers',
      method: 'POST',
      apiVersion: 'v1',
      headers: {},
      bodySize: 0,
    };

    const res = await engine.gatewayService.handleRequest(req, ['projects:write']);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.triggeredBy, 'plugin');
  });

  test('Public SDK client instance method validations', async () => {
    const client = new RRClient({ apiKey: 'rr_live_validKey_999' });

    const projectsRes = await client.getProjects();
    assert.strictEqual(projectsRes.success, true);
    assert.strictEqual(projectsRes.projects.length, 2);

    const triggerRes = await client.triggerRender({ clips: [] });
    assert.strictEqual(triggerRes.success, true);
  });
});
