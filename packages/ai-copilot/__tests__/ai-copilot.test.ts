import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  CopilotService,
  IntentService,
  PlanningService,
  PreviewService,
  SuggestionService,
  ApprovalService,
} from '../src/index';

describe('AI Editing Copilot Core Unit Tests', () => {

  test('Natural Language Parsing & Intent Detection', () => {
    const intents = new IntentService();

    // 1. Parse timeline editing split prompt
    const command1 = intents.parseIntent('Split active clip at 5 seconds.');
    assert.strictEqual(command1.type, 'timeline_edit');
    assert.ok(command1.confidence > 0.9);
    assert.strictEqual(command1.parameters.action, 'split');

    // 2. Parse asset replacements prompt
    const command2 = intents.parseIntent('Replace background asset with new image.');
    assert.strictEqual(command2.type, 'asset_replace');
    assert.ok(command2.confidence > 0.85);
  });

  test('Project context plan compilations and visual previews', () => {
    const planner = new PlanningService();
    const preview = new PreviewService();

    const intent: any = {
      type: 'timeline_edit',
      parameters: { action: 'split', targetId: 'clip-1', value: 5.0 },
    };

    const plan = planner.compilePlan(intent, {});

    // Verify correct plan details and change preview estimating impact
    assert.ok(plan.id);
    assert.strictEqual(plan.steps[0].action, 'MoveClipTransaction');
    assert.strictEqual(plan.preview.affectedSceneIds[0], 'scene-1');
    assert.ok(plan.preview.undoCheckpointId);

    // Visual highlights generation
    const highlights = preview.generateChangeVisualHighlights(plan.preview);
    assert.ok(highlights.includes(plan.preview.undoCheckpointId));
  });

  test('Proactive suggestions scans anomalies', () => {
    const suggestions = new SuggestionService();

    const badProject = {
      timeline: {
        audioGapsCount: 1,       // 1 gap
        subtitleOverlaysCount: 1, // 1 overlap
      },
    };

    const list = suggestions.analyzeProjectAnomalies(badProject);

    // Detect silent gaps and subtitle overlaps
    assert.strictEqual(list.length, 2);
    assert.strictEqual(list[0].type, 'silent_gap');
    assert.strictEqual(list[1].type, 'subtitle_overlap');
  });

  test('User approvals transitions', () => {
    const approvals = new ApprovalService();

    const req = approvals.createRequest('plan-123');
    assert.strictEqual(req.planId, 'plan-123');
    assert.strictEqual(req.status, 'pending');

    approvals.approve(req.id);
    assert.strictEqual(approvals.getRequest(req.id)?.status, 'approved');
  });
});
