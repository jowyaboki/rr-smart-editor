import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  globalApiGatewayPlatformEngine,
  globalApiPluginRegistry,
  RRClient,
  ApiRequest,
  ApiGatewayEndpointPlugin,
} from '../src/index';

describe('Enterprise API Gateway, Webhooks & Public SDK Tests', () => {
  test('Authentication via API Key prefixes and hashes', () => {
    const engine = globalApiGatewayPlatformEngine;

    // Successful authentications
    const auth1 = engine.authGateway.authenticateApiKey('rr_live_', 'HASHED_SECRET_999_KEY');
    assert.strictEqual(auth1.success, true);
    assert.strictEqual(auth1.apiKey?.id, 'key_broadway_live');

    // Failing password credentials
    const auth2 = engine.authGateway.authenticateApiKey('rr_live_', 'failing_secret_key');
    assert.strictEqual(auth2.success, false);
    assert.strictEqual(auth2.error, 'Invalid secret key.');
  });

  test('Rate limit tracking with token buckets and reset scopes', () => {
    const engine = globalApiGatewayPlatformEngine;
    engine.rateLimitService.resetLimits();

    const clientIp = '10.0.0.1';

    // Simulated requests
    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), false);
    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), false);
    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), false);

    // 4th request must be rate limited
    assert.strictEqual(engine.rateLimitService.isRateLimited(clientIp, 3), true);
  });

  test('Public SDK generators (TypeScript, Python, Go) compilations', () => {
    const engine = globalApiGatewayPlatformEngine;

    const tsSDK = engine.sdkGenerator.generateTypeScriptSDK();
    assert.ok(tsSDK.includes('class RRClient'));

    const pySDK = engine.sdkGenerator.generatePythonSDK();
    assert.ok(pySDK.includes('class RRClient:'));

    const goSDK = engine.sdkGenerator.generateGoSDK();
    assert.ok(goSDK.includes('type RRClient struct'));
  });

  test('Webhook delivery dispatcher with HMAC signatures and retry backoffs', async () => {
    const engine = globalApiGatewayPlatformEngine;

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
    assert.ok(dispatched[0].deliveryStatus === 'pending' || dispatched[0].deliveryStatus === 'success');

    // Wait short time to allow delivery simulation complete
    await new Promise((r) => setTimeout(r, 20));
    assert.strictEqual(dispatched[0].deliveryStatus, 'success');
  });

  test('Plugin dynamic API endpoint registrations and handlers', async () => {
    const engine = globalApiGatewayPlatformEngine;

    const mockPlugin: ApiGatewayEndpointPlugin = {
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

  test('Public SDK RRClient instance method validations', async () => {
    const client = new RRClient({ apiKey: 'rr_live_validKey_999' });

    const projectsRes = await client.getProjects();
    assert.strictEqual(projectsRes.success, true);
    assert.strictEqual(projectsRes.projects.length, 2);

    const triggerRes = await client.triggerRender({ clips: [] });
    assert.strictEqual(triggerRes.success, true);
  });
});
