import { Router, Request, Response } from 'express';
import { query } from '../db';
import { handleError, ApiError } from '../utils/errors';
import crypto from 'crypto';

const router = Router();

// 1. Retrieve Audit Logs (Phase 7 Enterprise Audits)
router.get('/:organizationId/audit-logs', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM audit_logs WHERE organization_id = $1 ORDER BY "createdAt" DESC',
      [organizationId]
    );
    res.json({ success: true, logs: result.rows });
  } catch (err) {
    handleError(err, res);
  }
});

// 2. Insert Audit Log manually (useful for custom system auditing actions)
router.post('/:organizationId/audit-logs', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const { userId, action, ipAddress, userAgent, details } = req.body;
    if (!action) {
      res.status(400).json({ success: false, error: 'action is required' });
      return;
    }

    const result = await query(
      'INSERT INTO audit_logs (organization_id, user_id, action, ip_address, user_agent, details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        organizationId,
        userId || null,
        action,
        ipAddress || req.ip || '127.0.0.1',
        userAgent || req.headers['user-agent'] || 'Express Server',
        details ? JSON.stringify(details) : '{}'
      ]
    );

    res.status(201).json({ success: true, log: result.rows[0] });
  } catch (err) {
    handleError(err, res);
  }
});

// 3. Manage Organization Policies (Phase 7 Org Policies)
router.get('/:organizationId/policies', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM organization_policies WHERE organization_id = $1',
      [organizationId]
    );

    // Default policy if not set
    const policy = result.rowCount && result.rowCount > 0 ? result.rows[0] : {
      organization_id: organizationId,
      require_mfa: false,
      allowed_ip_ranges: [],
      session_timeout_minutes: 1440,
      scim_enabled: false,
      saml_metadata_url: null,
    };

    res.json({ success: true, policy });
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/:organizationId/policies', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const { requireMfa, allowedIpRanges, sessionTimeoutMinutes, scimEnabled, samlMetadataUrl } = req.body;

    const current = await query('SELECT * FROM organization_policies WHERE organization_id = $1', [organizationId]);

    let result;
    if (current.rowCount && current.rowCount > 0) {
      result = await query(
        'UPDATE organization_policies SET require_mfa = $1, allowed_ip_ranges = $2, session_timeout_minutes = $3, scim_enabled = $4, saml_metadata_url = $5, "updatedAt" = CURRENT_TIMESTAMP WHERE organization_id = $6 RETURNING *',
        [requireMfa ?? false, allowedIpRanges || [], sessionTimeoutMinutes || 1440, scimEnabled ?? false, samlMetadataUrl || null, organizationId]
      );
    } else {
      result = await query(
        'INSERT INTO organization_policies (organization_id, require_mfa, allowed_ip_ranges, session_timeout_minutes, scim_enabled, saml_metadata_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [organizationId, requireMfa ?? false, allowedIpRanges || [], sessionTimeoutMinutes || 1440, scimEnabled ?? false, samlMetadataUrl || null]
      );
    }

    res.json({ success: true, policy: result.rows[0] });
  } catch (err) {
    handleError(err, res);
  }
});

// 4. API Tokens (Phase 7 API Tokens)
router.get('/:organizationId/tokens', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const result = await query(
      'SELECT id, organization_id, name, token_hash, scopes, expires_at, "createdAt" FROM api_tokens WHERE organization_id = $1',
      [organizationId]
    );
    res.json({ success: true, tokens: result.rows });
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/:organizationId/tokens', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const { name, scopes, expiresDays } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'name is required' });
      return;
    }

    // Generate token and cryptographical SHA-256 hash
    const token = 'rr_live_' + crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = expiresDays ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000) : null;

    const result = await query(
      'INSERT INTO api_tokens (organization_id, name, token_hash, scopes, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, organization_id, name, scopes, expires_at, "createdAt"',
      [organizationId, name, scopes || ['read:projects'], expiresAt]
    );

    res.status(201).json({
      success: true,
      rawToken: token, // Raw token returned ONLY once
      token: result.rows[0],
    });
  } catch (err) {
    handleError(err, res);
  }
});

export default router;
