import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import { query } from '../db';

describe('Cloud Billing, Subscriptions, and Quota Limits Integration Tests', () => {
  const mockOrgId = '88888888-8888-8888-8888-888888888888';

  before(async () => {
    // Clear test entries
    await query('DELETE FROM subscriptions WHERE organization_id = $1', [mockOrgId]);
    await query('DELETE FROM subscription_usage WHERE organization_id = $1', [mockOrgId]);
  });

  after(async () => {
    await query('DELETE FROM subscriptions WHERE organization_id = $1', [mockOrgId]);
    await query('DELETE FROM subscription_usage WHERE organization_id = $1', [mockOrgId]);
  });

  test('Billing Subscription upgrades, Usage tracking and Quotas enforcement', async () => {
    // 1. Insert initial subscription (free tier) explicitly
    const insertSub = await query(
      'INSERT INTO subscriptions (organization_id, tier) VALUES ($1, $2) RETURNING *',
      [mockOrgId, 'free']
    );
    assert.strictEqual(insertSub.rowCount, 1);
    assert.strictEqual(insertSub.rows[0].tier, 'free');

    // 2. Check subscription status (free tier)
    const subRes = await query('SELECT * FROM subscriptions WHERE organization_id = $1', [mockOrgId]);
    assert.strictEqual(subRes.rowCount, 1);
    assert.strictEqual(subRes.rows[0].tier, 'free');

    // 3. Upgrade organization to Pro tier
    const upgradeRes = await query(
      'UPDATE subscriptions SET tier = $1 WHERE organization_id = $2 RETURNING *',
      ['pro', mockOrgId]
    );
    assert.strictEqual(upgradeRes.rowCount, 1);
    assert.strictEqual(upgradeRes.rows[0].tier, 'pro');

    // 4. Track subscription usage (incremental accumulation)
    const start = new Date();
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const usageRes = await query(
      'INSERT INTO subscription_usage (organization_id, render_minutes_used, storage_bytes_used, ai_tokens_used, period_start, period_end) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [mockOrgId, 15.5, 1024 * 1024 * 10, 500, start, end]
    );

    console.log('USAGE RES RETURNED:', usageRes);

    assert.strictEqual(usageRes.rowCount, 1);
    assert.strictEqual(usageRes.rows[0].render_minutes_used, 15.5);
    assert.strictEqual(usageRes.rows[0].ai_tokens_used, 500);

    // 5. Update usage (incremental add)
    const updateRes = await query(
      'UPDATE subscription_usage SET render_minutes_used = render_minutes_used + $1, storage_bytes_used = storage_bytes_used + $2 WHERE organization_id = $3 RETURNING *',
      [10.0, 1024 * 1024 * 2, mockOrgId]
    );
    assert.strictEqual(updateRes.rowCount, 1);
    assert.strictEqual(updateRes.rows[0].render_minutes_used, 25.5);
  });
});
