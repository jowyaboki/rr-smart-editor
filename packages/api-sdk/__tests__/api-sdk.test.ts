import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  ApiGateway,
  WebhookService,
  ApiVersionManager,
  DocumentationService,
  SdkGenerator,
} from '../src/index';

describe('Public API Platform & SDK Ecosystem Core Unit Tests', () => {

  test('API Key Authentications and Scope Authorizations', () => {
    const gateway = new ApiGateway();

    // Register active key
    gateway.registerKey({
      id: 'key-1',
      key: 'rr-smart-studio-key',
      name: 'Corporate Key',
      scopes: ['read_project', 'write_timeline'],
    });

    // 1. Success check with correct scope
    const auth1 = gateway.authenticateRequest('rr-smart-studio-key', ['read_project']);
    assert.strictEqual(auth1.authorized, true);
    assert.strictEqual(auth1.apiKey?.name, 'Corporate Key');

    // 2. Forbidden scope check
    const auth2 = gateway.authenticateRequest('rr-smart-studio-key', ['publish']);
    assert.strictEqual(auth2.authorized, false);
    assert.strictEqual(auth2.reason, 'FORBIDDEN_SCOPE');

    // 3. Unauthenticated key check
    const auth3 = gateway.authenticateRequest('bad-key', []);
    assert.strictEqual(auth3.authorized, false);
    assert.strictEqual(auth3.reason, 'UNAUTHENTICATED');
  });

  test('Per-Key Rate Limiting windows', () => {
    const gateway = new ApiGateway();

    // Limit to 2 requests in window
    const key = 'user-key-1';

    const r1 = gateway.enforceRateLimit(key, 2);
    assert.strictEqual(r1.allowed, true);
    assert.strictEqual(r1.remaining, 1);

    const r2 = gateway.enforceRateLimit(key, 2);
    assert.strictEqual(r2.allowed, true);
    assert.strictEqual(r2.remaining, 0);

    const r3 = gateway.enforceRateLimit(key, 2);
    assert.strictEqual(r3.allowed, false); // Blocked!
  });

  test('Asynchronous webhook triggers and delivery logging', async () => {
    const webhooks = new WebhookService();

    webhooks.subscribe('render_completed', 'https://webhook.site/receiver1');
    webhooks.subscribe('render_completed', 'https://webhook.site/receiver2');

    // Trigger event
    const deliveries = await webhooks.triggerEvent('render_completed', { jobId: 'job-123', status: 'completed' });

    assert.strictEqual(deliveries.length, 2);
    assert.strictEqual(deliveries[0].event, 'render_completed');
    assert.strictEqual(deliveries[0].status, 'sent');
    assert.strictEqual(webhooks.getDeliveriesLog().length, 2);
  });

  test('Client SDK codes generations (TypeScript & Python)', () => {
    const generator = new SdkGenerator();

    const pyCode = generator.generateSdkClientCode('python');
    assert.ok(pyCode.includes('class ApiClient:'));
    assert.ok(pyCode.includes('def list_projects'));

    const tsCode = generator.generateSdkClientCode('typescript');
    assert.ok(tsCode.includes('export class ApiClient'));
  });

  test('OpenAPI documentation contracts generation', () => {
    const doc = new DocumentationService();
    const spec = doc.generateOpenApiSpec();

    assert.strictEqual(spec.openapi, '3.1.0');
    assert.strictEqual(spec.info.title, 'RR Smart Editor stable Public API');
    assert.ok(spec.paths['/v1/projects']);
  });
});
