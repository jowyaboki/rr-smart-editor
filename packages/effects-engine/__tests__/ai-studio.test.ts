import { describe, test } from 'node:test';
import assert from 'node:assert';

import { AIStudioOrchestrator } from '../../apps/web/src/features/ai-studio/orchestrator';

describe('AI Video Studio highest-level Orchestration unit tests', () => {

  test('Orchestrate Natural Prompts into Complete Video Projects', async () => {
    const studio = new AIStudioOrchestrator();

    // Trigger full pipeline orchestration
    const project = await studio.orchestrate('Create short brand promo video.');

    // 1. Verify project outputs are successfully generated
    assert.ok(project.id);
    assert.strictEqual(project.name, 'AI Generated: Brand Showcase Promo');
    assert.ok(project.script);
    assert.ok(project.storyboard.length > 0);

    // 2. Verify NLE timeline tracks & clips are structured correctly
    assert.strictEqual(project.timeline.tracks.length, 2);
    assert.strictEqual(project.timeline.tracks[0].clips.length, project.storyboard.length);
  });

  test('Auto Quality Reviews checklist warnings', () => {
    const studio = new AIStudioOrchestrator();

    // 1. Scenario: Good conformant project
    const goodStoryboard = [
      { id: 'sc-1', scriptSceneId: 's-1', visualUrl: 'https://images.com/visual1.png', subtitle: 'Ok' }
    ];
    const goodClips = [
      { id: 'clip-1', duration: 5.0 }
    ];
    const audit1 = studio.runQualityReview(goodStoryboard, goodClips, { palette: ['#fff'] });
    assert.strictEqual(audit1.passed, true);
    assert.strictEqual(audit1.warnings.length, 0);

    // 2. Scenario: Non-conformant project (missing assets & timeline timing overlaps)
    const badStoryboard = [
      { id: 'sc-1', scriptSceneId: 's-1', visualUrl: '', subtitle: 'Super long dialogues requiring at least 10 seconds of duration' }
    ];
    const badClips = [
      { id: 'clip-1', duration: 1.0 }
    ];
    const audit2 = studio.runQualityReview(badStoryboard, badClips, { palette: [] });
    assert.strictEqual(audit2.passed, false);
    assert.ok(audit2.warnings.some(w => w.includes('missing generated visual url')));
    assert.ok(audit2.warnings.some(w => w.includes('duration is too short')));
  });
});
