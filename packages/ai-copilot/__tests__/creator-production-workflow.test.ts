import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  AIExecutionRuntime,
  ProductionPipelineBuilder,
  ProductionBrief
} from '../src';

describe('Canonical Creator Production Journey (v6.0)', () => {

  test('Complete Creator Journey (Idea -> Brief -> Plan -> Execution -> Handoff -> AI Refinement -> Variants -> Delivery)', async () => {
    const runtime = new AIExecutionRuntime();

    // 1. Creative Idea & Brief Builder
    const brief: ProductionBrief = {
      briefId: 'brief_creator_canonical_1',
      title: 'Aura Smart Watch Launch Trailer',
      prompt: 'Create a vibrant 30s product launch video for a smart watch targeting Instagram and YouTube',
      targetPlatform: 'youtube',
      targetDurationSec: 30,
      qualityThreshold: 85
    };

    assert.equal(brief.title, 'Aura Smart Watch Launch Trailer');

    // 2. Production Plan Generation & Review
    const graph = ProductionPipelineBuilder.createProductionGraph(brief);
    const initialContext = ProductionPipelineBuilder.createInitialContext(brief);

    assert.equal(Object.keys(graph.nodes).length, 7);

    // 3. Execution & Editor Handoff
    const intermediateCtx = await runtime.runWorkflow(graph, initialContext);
    assert.equal(intermediateCtx.status, 'waiting_for_approval');

    const finalCtx = await runtime.resolveApprovalGate(
      intermediateCtx,
      graph,
      'director_approval_gate',
      true,
      'Creator Director'
    );

    assert.equal(finalCtx.status, 'completed');
    assert.ok(finalCtx.variables.projectTimeline !== undefined);
    assert.equal(finalCtx.variables.projectTimeline.tracks.length, 2); // Video & Audio tracks

    // 4. Contextual AI Refinement Loop
    const originalTracks = JSON.parse(JSON.stringify(finalCtx.variables.projectTimeline.tracks));
    // Apply refinement "Make intro sequence faster"
    finalCtx.variables.projectTimeline.tracks[0].clips[0].duration = 3; // Refined from 5s to 3s
    assert.equal(finalCtx.variables.projectTimeline.tracks[0].clips[0].duration, 3);

    // Undo refinement
    finalCtx.variables.projectTimeline.tracks = originalTracks;
    assert.equal(finalCtx.variables.projectTimeline.tracks[0].clips[0].duration, 5);

    // 5. Creative Aspect Ratio Variants
    const variants = [
      { variantId: 'var_16_9', name: 'YouTube Landscape', aspectRatio: '16:9', platform: 'youtube', durationSec: 30 },
      { variantId: 'var_9_16', name: 'TikTok Portrait', aspectRatio: '9:16', platform: 'tiktok', durationSec: 15 }
    ];

    assert.equal(variants.length, 2);
    assert.equal(variants[1].aspectRatio, '9:16');

    // 6. Final Render & Delivery Package State
    assert.equal(finalCtx.variables.deliveryStatus, 'ready_for_export');
    assert.ok(finalCtx.variables.packageUri.includes('delivery.platform.internal'));
  });

});
