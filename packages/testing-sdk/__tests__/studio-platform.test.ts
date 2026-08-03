import { describe, test } from 'node:test';
import assert from 'node:assert';

import { StudioPlatformEngine } from '../src/index';

describe('RR Smart Editor Studio Platform (v3.0) Foundation Integration Tests', () => {

  test('Phase 1 & 2: Studio Workspace & Production Management Workflow', () => {
    const studio = new StudioPlatformEngine();

    // 1. Create multiple productions within a workspace
    const ws = studio.workspaces.get('ws_global');
    assert.ok(ws);
    assert.strictEqual(ws.folders.length, 3);

    const prod1 = studio.createProduction('ws_global', 'Premium Fashion Brand campaign');
    const prod2 = studio.createProduction('ws_global', 'Automotive Promo Reel');

    assert.ok(ws.productions.includes(prod1.id));
    assert.ok(ws.productions.includes(prod2.id));

    // 2. Add tasks, assignees, deadlines, and milestones
    prod1.tasks.push({
      id: 'task_01',
      title: 'First-cut assemble edit',
      assignedTo: 'editor@studio.com',
      status: 'in_progress',
      deadline: '2026-10-15',
    });
    assert.strictEqual(prod1.tasks[0].assignedTo, 'editor@studio.com');

    // 3. Move production stages: Pre-prod -> Prod -> Post-prod -> Publishing -> Archive
    assert.strictEqual(prod1.status, 'pre_production');
    studio.updateProductionStatus(prod1.id, 'production');
    assert.strictEqual(prod1.status, 'production');

    studio.updateProductionStatus(prod1.id, 'post_production');
    assert.strictEqual(prod1.status, 'post_production');

    // 4. Toggle Favorites & verify activity logging
    studio.toggleFavorite('ws_global', prod1.id);
    assert.ok(ws.favorites.includes(prod1.id));
    assert.ok(ws.recentActivity.length > 0);
  });

  test('Phase 3: Review & Approval Pipelines with Frame Annotations', () => {
    const studio = new StudioPlatformEngine();
    const prod = studio.createProduction('ws_global', 'Broadway Behind-The-Scenes');

    // 1. Add frame comments with drawing coordinate annotations
    const comment = studio.addFrameComment(
      'clip_demo_101',
      120, // frame 120
      'lead_colorist@studio.com',
      'Increase exposure and highlight contrast here.',
      { type: 'draw', coords: [10, 20, 100, 200] }
    );

    assert.strictEqual(comment.user, 'lead_colorist@studio.com');
    assert.strictEqual(comment.frame, 120);
    assert.deepStrictEqual(comment.annotation?.coords, [10, 20, 100, 200]);

    // 2. Create approval request & history transitions
    const appReq = studio.createApprovalRequest(prod.id, 'V1 Client Cut review');
    assert.strictEqual(appReq.status, 'pending');
    assert.ok(appReq.clientReviewLink);

    appReq.history.push({
      reviewer: 'client_director@agency.com',
      status: 'approved',
      comment: 'Looks fantastic! Ready to publish.',
      timestamp: Date.now(),
    });
    appReq.status = 'approved';

    assert.strictEqual(prod.approvals[0].status, 'approved');
  });

  test('Phase 4: Media Operations, Automatic Transcoding, and Duplicate Detection', () => {
    const studio = new StudioPlatformEngine();

    // 1. Ingest asset
    const rawAsset = studio.ingestMedia('intro_raw_footage.mov', 'footage_raw_binary_stream_data_102');
    assert.strictEqual(rawAsset.name, 'intro_raw_footage.mov');
    assert.strictEqual(rawAsset.status, 'raw');

    // 2. Check for duplicates
    const duplicateAsset = studio.ingestMedia('copied_intro.mov', 'footage_raw_binary_stream_data_102');
    assert.strictEqual(duplicateAsset.id, rawAsset.id); // Deduplicated content hash match

    // 3. Process Transcoding, AI Tagging, resolution metadata extraction
    studio.processTranscoding(rawAsset.id);
    assert.strictEqual(rawAsset.status, 'ready');
    assert.ok(rawAsset.tags.includes('ai_ingested'));
    assert.strictEqual(rawAsset.qualityMetrics?.resolution, '3840x2160');
  });

  test('Phase 5: Visual Automation Center rules orchestration', () => {
    const studio = new StudioPlatformEngine();

    // Register rule: When footage_arrives -> transcode -> generate_proxies -> notify
    studio.registerAutomation(
      'Ingest pipeline automation',
      ['footage_arrives'],
      ['transcode', 'generate_proxies', 'notify_editors', 'assign_review', 'publish']
    );

    const executedActions = studio.triggerAutomation('footage_arrives', { assetId: 'ast_402' });
    assert.strictEqual(executedActions.length, 5);
    assert.ok(executedActions[0].includes('transcode'));
    assert.ok(executedActions[1].includes('generate_proxies'));
  });

  test('Phase 6: Executive, Producer, and Administrator dashboards', () => {
    const studio = new StudioPlatformEngine();
    studio.createProduction('ws_global', 'Promo Video A');
    studio.createProduction('ws_global', 'Promo Video B');

    const execDash = studio.getExecutiveDashboard('executive');
    assert.strictEqual(execDash.activeProductions, 2);
    assert.strictEqual(execDash.rolePermissionsApplied, 'executive');
    assert.ok(execDash.cloudCostsUSD > 0);
  });

  test('Phase 7: Enterprise Governance retention and audit exports', () => {
    const studio = new StudioPlatformEngine();
    studio.createWorkspace('ws_custom', 'Secure Workspace');

    // Set retention and legal hold
    studio.setRetentionPolicy('secure-extension', 365, true);
    const policy = studio.retentionPolicies.get('secure-extension');
    assert.ok(policy);
    assert.strictEqual(policy.days, 365);
    assert.strictEqual(policy.legalHold, true);

    // Export logs and verify actions are captured
    const auditLogsJson = studio.exportAuditLogs();
    assert.ok(auditLogsJson.includes('workspace_created'));
    assert.ok(auditLogsJson.includes('retention_policy_updated'));
  });

  test('Phase 8: Cross-Production Global Search Indexing', () => {
    const studio = new StudioPlatformEngine();

    // Spawn and tag items
    const prod = studio.createProduction('ws_global', 'Cinematic Drone campaign');
    const asset = studio.ingestMedia('drone_footage.mp4', 'drone_raw_data_stream_xyz');
    asset.tags.push('aerial', 'sunset');

    studio.addFrameComment('drone_footage.mp4', 10, 'director', 'Magnificent sunset shot.');

    // Perform global queries
    const searchResult1 = studio.globalSearch('sunset');
    assert.ok(searchResult1.length >= 2); // Matches asset tag and frame comment

    const searchResult2 = studio.globalSearch('Cinematic');
    assert.strictEqual(searchResult2[0].type, 'production');
    assert.strictEqual(searchResult2[0].id, prod.id);
  });
});
