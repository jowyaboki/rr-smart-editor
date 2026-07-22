import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  OrganizationService,
  WorkspaceService,
  PermissionService,
  QuotaService,
  AuditService,
  InvitationService,
} from '../src/index';

describe('Enterprise Workspaces & Multi-Tenant Platform Core Unit Tests', () => {

  test('Automatic Tenant Isolation Query Scoping', () => {
    const wsService = new WorkspaceService();

    // Set up dummy resources belonging to different workspace tenants
    const projects = [
      { id: 'proj-1', name: 'Intro', organizationId: 'org-A', workspaceId: 'ws-A1' },
      { id: 'proj-2', name: 'Promo', organizationId: 'org-A', workspaceId: 'ws-A2' },
      { id: 'proj-3', name: 'Short', organizationId: 'org-B', workspaceId: 'ws-B1' },
    ];

    // 1. Switch active workspace to Tenant A1
    wsService.switchActiveWorkspace('org-A', 'ws-A1', 'user-jules');

    // 2. Query must automatically isolate and return only Tenant A1 projects
    const scopedA1 = wsService.scopeQuery(projects);
    assert.strictEqual(scopedA1.length, 1);
    assert.strictEqual(scopedA1[0].id, 'proj-1');

    // 3. Switch active workspace to Tenant B1
    wsService.switchActiveWorkspace('org-B', 'ws-B1', 'user-jules');

    const scopedB1 = wsService.scopeQuery(projects);
    assert.strictEqual(scopedB1.length, 1);
    assert.strictEqual(scopedB1[0].id, 'proj-3');
  });

  test('Role-Based Access Control Privileges Enforcements', () => {
    const perms = new PermissionService();

    // Owner has manager rights, Viewer does not
    assert.strictEqual(perms.isAuthorized('owner', 'manager'), true);
    assert.strictEqual(perms.isAuthorized('viewer', 'manager'), false);

    // Administrator has Editor rights
    assert.strictEqual(perms.isAuthorized('administrator', 'editor'), true);
  });

  test('Quotas limits checking & Usage Increments', () => {
    const quota = new QuotaService();
    const wsId = 'ws-test-limits';

    // Set quotas limits: projects=2
    quota.setWorkspaceQuota(wsId, {
      projectsLimit: 2,
      assetsLimit: 10,
      storageBytesLimit: 1024,
      renderMinutesLimit: 60,
      aiCreditsLimit: 100,
      apiRequestsLimit: 1000,
      pluginsLimit: 5,
      templatesLimit: 5,
    });

    // Increment projects usage twice (reaches limit)
    quota.recordUsageIncrement(wsId, 'projectsLimit');
    quota.recordUsageIncrement(wsId, 'projectsLimit');

    const check1 = quota.checkQuotaLimits(wsId, 'projectsLimit');
    assert.strictEqual(check1.allowed, false); // Quota exceeded!
    assert.strictEqual(check1.current, 2);
    assert.strictEqual(check1.limit, 2);

    // Assets limit is 10, usage is 0, should be allowed
    const check2 = quota.checkQuotaLimits(wsId, 'assetsLimit');
    assert.strictEqual(check2.allowed, true);
  });

  test('Audit logging tracking', () => {
    const audit = new AuditService();

    audit.logEvent('user-1', 'org-A', 'ws-A', 'project_change', 'Updated clip offset.');
    audit.logEvent('user-2', 'org-A', 'ws-B', 'login', 'Logged in successfully.');

    const logs = audit.getLogsByWorkspace('ws-A');
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].action, 'project_change');
  });

  test('Email invitations acceptances & role assignments', () => {
    const inviteService = new InvitationService();

    const invite = inviteService.createInvitation('new-editor@rrstudio.com', 'ws-1', 'editor');
    assert.strictEqual(invite.role, 'editor');
    assert.strictEqual(invite.accepted, false);

    // Accept invitation
    const accepted = inviteService.acceptInvitation(invite.id);
    assert.strictEqual(accepted.accepted, true);
  });
});
