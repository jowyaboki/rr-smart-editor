import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import { query } from '../db';
import crypto from 'crypto';

describe('Cloud Enterprise Policies, Audits and API Tokens Integration Tests', () => {
  const mockOrgId = '99999999-9999-9999-9999-999999999999';

  before(async () => {
    // Clear test tables
    await query('DELETE FROM organization_policies WHERE organization_id = $1', [mockOrgId]);
    await query('DELETE FROM audit_logs WHERE organization_id = $1', [mockOrgId]);
    await query('DELETE FROM api_tokens WHERE organization_id = $1', [mockOrgId]);
  });

  after(async () => {
    await query('DELETE FROM organization_policies WHERE organization_id = $1', [mockOrgId]);
    await query('DELETE FROM audit_logs WHERE organization_id = $1', [mockOrgId]);
    await query('DELETE FROM api_tokens WHERE organization_id = $1', [mockOrgId]);
  });

  test('Organization security policies configuration and retrieval', async () => {
    // 1. Create policy
    const insertRes = await query(
      'INSERT INTO organization_policies (organization_id, require_mfa, allowed_ip_ranges, session_timeout_minutes) VALUES ($1, $2, $3, $4) RETURNING *',
      [mockOrgId, true, ['10.0.0.0/8'], 120]
    );

    assert.strictEqual(insertRes.rowCount, 1);
    assert.strictEqual(insertRes.rows[0].require_mfa, true);
    assert.strictEqual(insertRes.rows[0].session_timeout_minutes, 120);

    // 2. Fetch policies
    const selectRes = await query('SELECT * FROM organization_policies WHERE organization_id = $1', [mockOrgId]);
    assert.strictEqual(selectRes.rowCount, 1);
    assert.strictEqual(selectRes.rows[0].require_mfa, true);
  });

  test('E2E Audit logs capture and compliance listing', async () => {
    // 1. Insert audit log explicitly matching parameters
    const logRes = await query(
      'INSERT INTO audit_logs (organization_id, user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [mockOrgId, null, 'auth.login', '192.168.1.1', 'Mozilla/5.0']
    );

    assert.strictEqual(logRes.rowCount, 1);
    assert.strictEqual(logRes.rows[0].action, 'auth.login');
    assert.strictEqual(logRes.rows[0].ip_address, '192.168.1.1');

    // 2. Select logs
    const listRes = await query('SELECT * FROM audit_logs WHERE organization_id = $1', [mockOrgId]);
    assert.strictEqual(listRes.rowCount, 1);
  });

  test('Programmatic API Token hashing and retrieval validation', async () => {
    const rawToken = 'rr_live_abc123';
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 1. Create API token
    const tokenRes = await query(
      'INSERT INTO api_tokens (organization_id, name, token_hash, scopes) VALUES ($1, $2, $3, $4) RETURNING *',
      [mockOrgId, 'Production Token', hash, ['read:projects', 'write:renders']]
    );

    assert.strictEqual(tokenRes.rowCount, 1);
    assert.strictEqual(tokenRes.rows[0].name, 'Production Token');
    assert.strictEqual(tokenRes.rows[0].token_hash, hash);

    // 2. Fetch Token from DB (to authenticate)
    const activeTokenRes = await query('SELECT * FROM api_tokens WHERE organization_id = $1', [mockOrgId]);
    assert.strictEqual(activeTokenRes.rowCount, 1);
  });
});
