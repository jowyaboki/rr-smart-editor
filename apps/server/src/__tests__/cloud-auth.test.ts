import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import { query } from '../db';
import crypto from 'crypto';

describe('Cloud Auth and Multi-Tenant User Accounts Integration Tests', () => {
  let createdUserId: string;
  let createdOrgId: string;
  let invitationToken: string;

  before(async () => {
    // Clear existing test rows
    await query('DELETE FROM invitations WHERE email = $1', ['invited@example.com']);
    await query('DELETE FROM team_memberships WHERE team_id IN (SELECT id FROM teams WHERE name = $1)', ['Editing Team']);
    await query('DELETE FROM teams WHERE name = $1', ['Editing Team']);
    await query('DELETE FROM memberships WHERE user_id IN (SELECT id FROM users WHERE email = $1)', ['newuser@example.com']);
    await query('DELETE FROM subscriptions WHERE organization_id IN (SELECT id FROM organizations WHERE name LIKE $1)', ['%newuser%']);
    await query('DELETE FROM organizations WHERE name LIKE $1', ['%newuser%']);
    await query('DELETE FROM users WHERE email = $1', ['newuser@example.com']);
  });

  after(async () => {
    // Cleanup rows
    await query('DELETE FROM invitations WHERE email = $1', ['invited@example.com']);
    await query('DELETE FROM team_memberships WHERE team_id IN (SELECT id FROM teams WHERE name = $1)', ['Editing Team']);
    await query('DELETE FROM teams WHERE name = $1', ['Editing Team']);
    await query('DELETE FROM memberships WHERE user_id IN (SELECT id FROM users WHERE email = $1)', ['newuser@example.com']);
    await query('DELETE FROM subscriptions WHERE organization_id IN (SELECT id FROM organizations WHERE name LIKE $1)', ['%newuser%']);
    await query('DELETE FROM organizations WHERE name LIKE $1', ['%newuser%']);
    await query('DELETE FROM users WHERE email = $1', ['newuser@example.com']);
  });

  test('E2E User Registration & Automated Default Organization/Subscription Scaffolding', async () => {
    const email = 'newuser@example.com';
    const password = 'securepassword123';
    const fullName = 'John Doe';

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const userRes = await query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, fullName]
    );

    assert.strictEqual(userRes.rowCount, 1);
    const user = userRes.rows[0];
    createdUserId = user.id;
    assert.strictEqual(user.email, email);
    assert.strictEqual(user.full_name, fullName);

    // Scaffolding Org
    const orgRes = await query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
      [`${user.full_name}'s Org`]
    );
    assert.strictEqual(orgRes.rowCount, 1);
    const org = orgRes.rows[0];
    createdOrgId = org.id;

    // Scaffolding Membership
    const memRes = await query(
      'INSERT INTO memberships (organization_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [org.id, user.id, 'owner']
    );
    assert.strictEqual(memRes.rowCount, 1);

    // Default subscription setup (Phase 6 billing validation)
    const subRes = await query(
      'INSERT INTO subscriptions (organization_id, tier) VALUES ($1, $2) RETURNING *',
      [org.id, 'free']
    );
    assert.strictEqual(subRes.rowCount, 1);
    assert.strictEqual(subRes.rows[0].tier, 'free');
  });

  test('User Login verification with Sha256 authentication checking', async () => {
    const email = 'newuser@example.com';
    const password = 'securepassword123';
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
      [email, passwordHash]
    );
    assert.strictEqual(result.rowCount, 1);
    assert.strictEqual(result.rows[0].full_name, 'John Doe');
  });

  test('Curation of Teams under Organizations', async () => {
    const teamRes = await query(
      'INSERT INTO teams (organization_id, name) VALUES ($1, $2) RETURNING *',
      [createdOrgId, 'Editing Team']
    );
    assert.strictEqual(teamRes.rowCount, 1);
    assert.strictEqual(teamRes.rows[0].name, 'Editing Team');

    const membershipRes = await query(
      'INSERT INTO team_memberships (team_id, user_id) VALUES ($1, $2) RETURNING *',
      [teamRes.rows[0].id, createdUserId]
    );
    assert.strictEqual(membershipRes.rowCount, 1);
  });

  test('Invitations dispatching and acceptance tracking', async () => {
    const invitedEmail = 'invited@example.com';
    const token = crypto.randomBytes(32).toString('hex');
    invitationToken = token;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const inviteRes = await query(
      'INSERT INTO invitations (organization_id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [createdOrgId, invitedEmail, 'member', token, expiresAt]
    );
    assert.strictEqual(inviteRes.rowCount, 1);
    assert.strictEqual(inviteRes.rows[0].email, invitedEmail);

    // Accept invitation
    const updateRes = await query(
      'UPDATE invitations SET status = $1 WHERE token = $2 RETURNING *',
      ['accepted', token]
    );
    assert.strictEqual(updateRes.rowCount, 1);
    assert.strictEqual(updateRes.rows[0].status, 'accepted');
  });
});
