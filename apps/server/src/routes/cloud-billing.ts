import { Router, Request, Response } from 'express';
import { query } from '../db';
import { handleError, ApiError } from '../utils/errors';

const router = Router();

// Define clean quota limits per subscription tier (Phase 6 billing spec)
const TIER_QUOTAS: Record<string, { renderMinutes: number; storageBytes: number; aiTokens: number }> = {
  free: { renderMinutes: 10, storageBytes: 1024 * 1024 * 512, aiTokens: 1000 }, // 512MB
  pro: { renderMinutes: 120, storageBytes: 1024 * 1024 * 1024 * 50, aiTokens: 25000 }, // 50GB
  studio: { renderMinutes: 1000, storageBytes: 1024 * 1024 * 1024 * 500, aiTokens: 150000 }, // 500GB
  enterprise: { renderMinutes: 10000, storageBytes: 1024 * 1024 * 1024 * 1000 * 5, aiTokens: 2000000 }, // 5TB
};

// Check quotas status
router.get('/:organizationId/quotas', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    // 1. Get subscription tier
    const subRes = await query('SELECT * FROM subscriptions WHERE organization_id = $1', [organizationId]);
    const tier = subRes.rowCount && subRes.rowCount > 0 ? subRes.rows[0].tier : 'free';
    const quotas = TIER_QUOTAS[tier] || TIER_QUOTAS.free;

    // 2. Get active usage
    const usageRes = await query('SELECT * FROM subscription_usage WHERE organization_id = $1', [organizationId]);
    const usage = usageRes.rowCount && usageRes.rowCount > 0 ? usageRes.rows[0] : {
      render_minutes_used: 0,
      storage_bytes_used: 0,
      ai_tokens_used: 0,
    };

    res.json({
      success: true,
      tier,
      quotas,
      usage: {
        renderMinutesUsed: usage.render_minutes_used,
        storageBytesUsed: parseInt(usage.storage_bytes_used),
        aiTokensUsed: usage.ai_tokens_used,
      },
      exceeded: {
        renderMinutes: usage.render_minutes_used >= quotas.renderMinutes,
        storageBytes: parseInt(usage.storage_bytes_used) >= quotas.storageBytes,
        aiTokens: usage.ai_tokens_used >= quotas.aiTokens,
      }
    });
  } catch (err) {
    handleError(err, res);
  }
});

// Upgrade Subscription tier
router.post('/:organizationId/upgrade', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const { tier } = req.body;
    if (!tier || !['free', 'pro', 'studio', 'enterprise'].includes(tier)) {
      res.status(400).json({ success: false, error: 'Valid tier is required' });
      return;
    }

    const result = await query(
      'UPDATE subscriptions SET tier = $1 WHERE organization_id = $2 RETURNING *',
      [tier, organizationId]
    );

    res.json({
      success: true,
      subscription: result.rows[0] || { organization_id: organizationId, tier, status: 'active' },
    });
  } catch (err) {
    handleError(err, res);
  }
});

// Update usage record (render minutes, storage bytes used, AI tokens used)
router.post('/:organizationId/usage', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const { renderMinutes, storageBytes, aiTokens } = req.body;

    const currentUsage = await query('SELECT * FROM subscription_usage WHERE organization_id = $1', [organizationId]);

    let result;
    if (currentUsage.rowCount && currentUsage.rowCount > 0) {
      result = await query(
        'UPDATE subscription_usage SET render_minutes_used = render_minutes_used + $1, storage_bytes_used = storage_bytes_used + $2, ai_tokens_used = ai_tokens_used + $3, "updatedAt" = CURRENT_TIMESTAMP WHERE organization_id = $4 RETURNING *',
        [renderMinutes || 0, storageBytes || 0, aiTokens || 0, organizationId]
      );
    } else {
      const start = new Date();
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      result = await query(
        'INSERT INTO subscription_usage (organization_id, render_minutes_used, storage_bytes_used, ai_tokens_used, period_start, period_end) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [organizationId, renderMinutes || 0, storageBytes || 0, aiTokens || 0, start, end]
      );
    }

    res.json({
      success: true,
      usage: result.rows[0],
    });
  } catch (err) {
    handleError(err, res);
  }
});

export default router;
