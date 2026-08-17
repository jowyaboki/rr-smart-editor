import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  AIExecutionRuntime,
  ProductionPipelineBuilder,
  ProductionBrief,
  ProductionCompletionEngine,
  AssetItem,
  BrandRulesConfig
} from '../src';

describe('Canonical Production Completion Pipeline (v7.0)', () => {

  test('Complete End-to-End Production Completion Workflow (30s Moroccan Brand Promo)', async () => {
    const runtime = new AIExecutionRuntime();

    // 1. Idea & Production Brief
    const brief: ProductionBrief = {
      briefId: 'brief_atlas_craft_30s',
      title: 'Atlas Craft Moroccan Luxury Artisans',
      prompt: 'Create a 30s luxury brand promo highlighting hand-crafted artisan leather in Marrakech',
      targetPlatform: 'youtube',
      targetDurationSec: 30,
      qualityThreshold: 90
    };

    assert.equal(brief.title, 'Atlas Craft Moroccan Luxury Artisans');

    // 2. Production Plan & Human Director Approval
    const graph = ProductionPipelineBuilder.createProductionGraph(brief);
    const initialContext = ProductionPipelineBuilder.createInitialContext(brief);

    const intermediateCtx = await runtime.runWorkflow(graph, initialContext);
    assert.equal(intermediateCtx.status, 'waiting_for_approval');

    const context = await runtime.resolveApprovalGate(
      intermediateCtx,
      graph,
      'director_approval_gate',
      true,
      'Creative Director'
    );
    assert.equal(context.status, 'completed');

    // 3. Intelligent Asset Pipeline Evaluation & Replacement
    let assets: AssetItem[] = [
      { id: 'ast_1', type: 'video', semanticDescription: 'Marrakech Medina Artisan Leather', visualStyle: 'Cinematic 4K', durationSec: 10, aspectRatio: '16:9', resolution: '3840x2160', state: 'REQUIRED' },
      { id: 'ast_2', type: 'audio', semanticDescription: 'Traditional Oud & Ambient Beats', visualStyle: 'Warm', durationSec: 30, aspectRatio: 'N/A', resolution: 'N/A', state: 'REQUIRED' }
    ];

    const evalResult = ProductionCompletionEngine.evaluateAssetPipeline(assets);
    assert.equal(evalResult.complete, false);

    // Assign URIs and approve assets
    assets[0].uri = 'https://stock.media.internal/clips/atlas_leather_4k.mp4';
    assets[0].state = 'APPROVED';
    assets[1].uri = 'https://stock.media.internal/audio/atlas_oud_bg.mp3';
    assets[1].state = 'APPROVED';

    // Test asset replacement with undo rollback
    const replacedAssets = ProductionCompletionEngine.replaceAsset(assets, 'ast_1', 'https://stock.media.internal/clips/atlas_leather_alt_4k.mp4');
    assert.equal(replacedAssets[0].uri, 'https://stock.media.internal/clips/atlas_leather_alt_4k.mp4');
    assert.equal(replacedAssets[0].state, 'REPLACED');

    const rolledBackAssets = ProductionCompletionEngine.rollbackAssetReplacement(replacedAssets, 'ast_1');
    assert.equal(rolledBackAssets[0].uri, 'https://stock.media.internal/clips/atlas_leather_4k.mp4');

    // 4. Voice & Audio Production Plan
    const audioPlan = ProductionCompletionEngine.buildAudioPlan(
      'Discover the timeless elegance of hand-crafted Moroccan leather by Atlas Craft.',
      'Youssef (Moroccan Narrator)'
    );

    assert.equal(audioPlan.targetLoudnessLufs, -14.0);
    assert.equal(audioPlan.speakerRole, 'Youssef (Moroccan Narrator)');

    // 5. Captions & Text Safe Area Workflow
    const captions = ProductionCompletionEngine.generateCaptions(
      'Discover the timeless elegance of hand-crafted Moroccan leather. Experience authentic Marrakech artistry.',
      30
    );

    assert.equal(captions.length, 2);
    assert.equal(captions[0].safeAreaValid, true);

    // 6. Brand Intelligence Rules
    const brandRules: BrandRulesConfig = {
      brandName: 'Atlas Craft',
      requiredColors: ['#d97706', '#050b14'],
      requiredFonts: ['Playfair Display', 'Inter'],
      requiredCtaText: 'Discover Atlas Craft Today'
    };

    context.variables.ctaText = 'Discover Atlas Craft Today';

    // 7. Production Quality Gates Auditor
    const qualityResult = ProductionCompletionEngine.runProductionQualityGates(assets, captions, brandRules, context);
    assert.equal(qualityResult.passed, true);
    assert.equal(qualityResult.checks.renderReadiness, true);

    // 8. One-Click Production Orchestrator ("GENERATE FINAL VIDEO")
    const renderResult = await ProductionCompletionEngine.generateFinalVideo(context, qualityResult);
    assert.equal(renderResult.status, 'READY_FOR_DELIVERY');
    assert.ok(renderResult.deliveryPackageUri.includes('atlas_craft'));

    // 9. Multi-Format Aspect Ratio Lineage (16:9, 9:16, 1:1, 4:5)
    const variant916 = ProductionCompletionEngine.createVariant(context.projectId, '9:16');
    const variant11 = ProductionCompletionEngine.createVariant(context.projectId, '1:1');
    const variant45 = ProductionCompletionEngine.createVariant(context.projectId, '4:5');

    assert.equal(variant916.parentProjectId, context.projectId);
    assert.equal(variant916.variantType, '9:16');
    assert.equal(variant11.variantType, '1:1');
    assert.equal(variant45.variantType, '4:5');
  });

});
