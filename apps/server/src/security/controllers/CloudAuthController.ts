import { Request, Response } from 'express';
import { query } from '../../db';
import crypto from 'crypto';

export class CloudAuthController {
  // Authentication - register
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
      }

      // Check duplicate
      const userCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (userCheck.rowCount && userCheck.rowCount > 0) {
        res.status(400).json({ success: false, error: 'Email already registered' });
        return;
      }

      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      const userRes = await query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
        [email, passwordHash, fullName || '']
      );

      // Automatically create a default personal Organization for the user (multi-tenancy)
      const user = userRes.rows[0];
      const orgRes = await query(
        'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
        [`${user.full_name || user.email}'s Org`]
      );
      const org = orgRes.rows[0];

      // Add user membership to organization as owner
      await query(
        'INSERT INTO memberships (organization_id, user_id, role) VALUES ($1, $2, $3)',
        [org.id, user.id, 'owner']
      );

      // Create default subscription (Free tier)
      await query(
        'INSERT INTO subscriptions (organization_id, tier) VALUES ($1, $2)',
        [org.id, 'free']
      );

      res.status(201).json({
        success: true,
        user,
        organization: org,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Authentication - login
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
      }

      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
        [email, passwordHash]
      );

      if (!result.rowCount || result.rowCount === 0) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const user = result.rows[0];
      delete user.password_hash;

      // Get user organizations
      const orgsRes = await query(
        'SELECT o.*, m.role FROM organizations o JOIN memberships m ON o.id = m.organization_id WHERE m.user_id = $1',
        [user.id]
      );

      res.json({
        success: true,
        user,
        organizations: orgsRes.rows,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Organizations curation
  public async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { name, domain, userId } = req.body;
      if (!name || !userId) {
        res.status(400).json({ success: false, error: 'Name and userId are required' });
        return;
      }

      const orgRes = await query(
        'INSERT INTO organizations (name, domain) VALUES ($1, $2) RETURNING *',
        [name, domain || null]
      );
      const org = orgRes.rows[0];

      await query(
        'INSERT INTO memberships (organization_id, user_id, role) VALUES ($1, $2, $3)',
        [org.id, userId, 'owner']
      );

      // Create default subscription (Free tier)
      await query(
        'INSERT INTO subscriptions (organization_id, tier) VALUES ($1, $2)',
        [org.id, 'free']
      );

      res.status(201).json({ success: true, organization: org });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Teams management
  public async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId, name } = req.body;
      if (!organizationId || !name) {
        res.status(400).json({ success: false, error: 'organizationId and name are required' });
        return;
      }

      const result = await query(
        'INSERT INTO teams (organization_id, name) VALUES ($1, $2) RETURNING *',
        [organizationId, name]
      );
      res.status(201).json({ success: true, team: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Invitations
  public async inviteUser(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId, email, role } = req.body;
      if (!organizationId || !email) {
        res.status(400).json({ success: false, error: 'organizationId and email are required' });
        return;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

      const result = await query(
        'INSERT INTO invitations (organization_id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [organizationId, email, role || 'member', token, expiresAt]
      );

      res.status(201).json({ success: true, invitation: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Accept Invitation
  public async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { token, userId } = req.body;
      if (!token || !userId) {
        res.status(400).json({ success: false, error: 'token and userId are required' });
        return;
      }

      const inviteRes = await query('SELECT * FROM invitations WHERE token = $1 AND status = $2', [token, 'pending']);
      if (!inviteRes.rowCount || inviteRes.rowCount === 0) {
        res.status(400).json({ success: false, error: 'Invalid or expired invitation token' });
        return;
      }

      const invite = inviteRes.rows[0];
      if (new Date(invite.expires_at) < new Date()) {
        await query('UPDATE invitations SET status = $1 WHERE id = $2', ['expired', invite.id]);
        res.status(400).json({ success: false, error: 'Invitation has expired' });
        return;
      }

      // Add membership
      await query(
        'INSERT INTO memberships (organization_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (organization_id, user_id) DO UPDATE SET role = $3',
        [invite.organization_id, userId, invite.role]
      );

      // Update invitation status
      await query('UPDATE invitations SET status = $1 WHERE id = $2', ['accepted', invite.id]);

      res.json({ success: true, message: 'Invitation accepted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const cloudAuthController = new CloudAuthController();
export default cloudAuthController;
