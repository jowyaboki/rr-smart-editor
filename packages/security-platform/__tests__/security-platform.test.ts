import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  globalSecurityPlatformEngine,
  globalSecurityPluginRegistry,
  Identity,
  ComplianceValidatorPlugin,
} from '../src/index';

describe('Enterprise Security, Governance & Compliance Core Unit Tests', () => {
  const mockIdentity: Identity = {
    id: 'user_clara',
    username: 'Clara',
    email: 'clara@broadway.net',
    status: 'active',
    mfaEnabled: false,
    authProvider: 'password',
    attributes: { department: 'Marketing', clearanceLevel: 'internal', location: 'US' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  test('Identity Service handles authentication and credential evaluations', async () => {
    const engine = globalSecurityPlatformEngine;
    engine.identityService.registerIdentity(mockIdentity);

    // Test successful authentication simulation
    const authRes1 = await engine.identityService.authenticate('Clara', { password: 'valid_password' });
    assert.strictEqual(authRes1.success, true);
    assert.strictEqual(authRes1.identity?.id, 'user_clara');

    // Test failed authentication simulation
    const authRes2 = await engine.identityService.authenticate('Clara', { password: 'failing_password' });
    assert.strictEqual(authRes2.success, false);
    assert.strictEqual(authRes2.error, 'Invalid password credentials.');
  });

  test('Policy Service evaluates rules, permissions and ABAC conditions', async () => {
    const engine = globalSecurityPlatformEngine;

    // Clara has 'clearanceLevel: internal' which matches the allow rule for 'projects/*'
    const evalRes1 = await engine.policyService.evaluateAccess(mockIdentity, 'projects/pro_01', 'read');
    assert.strictEqual(evalRes1.allow, true);

    // Clara does NOT have 'clearanceLevel: critical' which triggers a deny rule on 'assets/critical/*'
    const evalRes2 = await engine.policyService.evaluateAccess(mockIdentity, 'assets/critical/scene_01', 'delete');
    assert.strictEqual(evalRes2.allow, false);
    assert.strictEqual(evalRes2.reason, 'Explicit deny rule matched.');
  });

  test('Session Service controls active lifecycles, revocations and device info', () => {
    const engine = globalSecurityPlatformEngine;

    const sess = engine.sessionService.createSession('user_clara', 'Mozilla Chrome', '192.168.1.50', 30);
    assert.strictEqual(sess.identityId, 'user_clara');
    assert.strictEqual(sess.status, 'active');

    const sessionsList = engine.sessionService.listSessions('user_clara');
    assert.strictEqual(sessionsList.length, 1);

    // Revoke session
    engine.sessionService.revokeSession(sess.id);
    assert.strictEqual(sess.status, 'revoked');
  });

  test('Secret Service and secure Rotation schedules', async () => {
    const engine = globalSecurityPlatformEngine;

    engine.secretService.registerSecretReference(
      {
        id: 'sec_stripe_key',
        name: 'STRIPE_API_KEY',
        vaultPath: 'secrets/payments/stripe',
        provider: 'vault',
        version: 'v1',
        createdAt: new Date().toISOString(),
      },
      'sk_test_51Mz00000000'
    );

    const val1 = await engine.secretService.getSecret('STRIPE_API_KEY');
    assert.strictEqual(val1, 'sk_test_51Mz00000000');

    // Rotate secret
    await engine.secretService.rotateSecret('sec_stripe_key', 'sk_test_rotated_newValue');
    const val2 = await engine.secretService.getSecret('STRIPE_API_KEY');
    assert.strictEqual(val2, 'sk_test_rotated_newValue');
  });

  test('Encryption Service envelope encrypts and rotates crypt keys', async () => {
    const engine = globalSecurityPlatformEngine;

    const payload = 'Pradeep_Broadway_Production_Script_2024';
    const { ciphertext, keyVersion } = await engine.encryptionService.envelopeEncrypt(payload, 'key_root_01');

    assert.ok(ciphertext.length > 0);
    assert.strictEqual(keyVersion, 'v1');

    const decrypted = await engine.encryptionService.envelopeDecrypt(ciphertext, 'key_root_01', keyVersion);
    assert.strictEqual(decrypted, payload);
  });

  test('Compliance Service checklist validations and score check', async () => {
    const engine = globalSecurityPlatformEngine;

    const mockAuditLogs = [
      {
        id: 'event_01',
        timestamp: new Date().toISOString(),
        action: 'authentication.success',
        actorId: 'user_clara',
        actorType: 'user' as const,
        status: 'success' as const,
        details: { country: 'US' },
        ipAddress: '192.168.1.50',
      },
      {
        id: 'event_02',
        timestamp: new Date().toISOString(),
        action: 'policy.violation',
        actorId: 'user_clara',
        actorType: 'user' as const,
        status: 'failure' as const,
        details: { resource: 'assets/critical/scene_01' },
        ipAddress: '192.168.1.50',
      },
    ];

    const soc2Profile = await engine.complianceService.validateCompliance('SOC2', mockAuditLogs);
    assert.strictEqual(soc2Profile.framework, 'SOC2');
    assert.strictEqual(soc2Profile.complianceScore, 100); // Standard soc2 baseline holds

    // GDPR checklist failure (country outside EU residency with check active)
    const gdprProfile = await engine.complianceService.validateCompliance('GDPR', [
      {
        ...mockAuditLogs[0],
        details: { country: 'CN' }, // Out EU country triggers GDPR checklist mismatch
      },
    ]);
    assert.ok(gdprProfile.complianceScore < 100);
    assert.strictEqual(gdprProfile.violationsCount, 1);
  });

  test('Security Monitoring Service detects brute-force and escalations', () => {
    const engine = globalSecurityPlatformEngine;

    const mockFailedLogs = [
      { id: 'l1', timestamp: new Date().toISOString(), action: 'authentication.failure', actorId: 'user_clara', actorType: 'user' as const, status: 'failure' as const, details: {}, ipAddress: '10.0.0.1' },
      { id: 'l2', timestamp: new Date().toISOString(), action: 'authentication.failure', actorId: 'user_clara', actorType: 'user' as const, status: 'failure' as const, details: {}, ipAddress: '10.0.0.1' },
      { id: 'l3', timestamp: new Date().toISOString(), action: 'authentication.failure', actorId: 'user_clara', actorType: 'user' as const, status: 'failure' as const, details: {}, ipAddress: '10.0.0.1' },
      { id: 'l4', timestamp: new Date().toISOString(), action: 'authentication.failure', actorId: 'user_clara', actorType: 'user' as const, status: 'failure' as const, details: {}, ipAddress: '10.0.0.1' },
    ];

    const anomalies = engine.monitoringService.analyzeAuditLogsForAnomalies(mockFailedLogs);
    assert.strictEqual(anomalies.length, 1);
    assert.strictEqual(anomalies[0].source, 'auth_failure');
    assert.ok(anomalies[0].description.includes('IP address \'10.0.0.1\''));
  });

  test('Security dynamic plugin registry integrations', async () => {
    const complianceValidator: ComplianceValidatorPlugin = {
      id: 'plug_soc2_val',
      name: 'SOC2 Premium Validator',
      supportedFrameworks: ['SOC2'],
      async validate(framework, records) {
        return {
          id: 'plug_soc2_profile',
          framework: 'SOC2',
          rulesCheckedCount: 50,
          violationsCount: 0,
          complianceScore: 100,
          lastAuditedAt: new Date().toISOString(),
          dataResidencyCountry: 'EU',
        };
      },
    };

    globalSecurityPluginRegistry.registerComplianceValidator(complianceValidator);

    const engine = globalSecurityPlatformEngine;
    const soc2Res = await engine.complianceService.validateCompliance('SOC2', []);

    assert.strictEqual(soc2Res.rulesCheckedCount, 50);
    assert.strictEqual(soc2Res.complianceScore, 100);
  });
});
