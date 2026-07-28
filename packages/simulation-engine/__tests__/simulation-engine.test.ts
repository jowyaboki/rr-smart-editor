import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Project, Workflow, WorkflowVariable } from '@ai-video-editor/shared';
import { SimulationEngine, DigitalTwin, PredictionProvider, Validator, OptimizationStrategy, SimulationAdapter } from '../src/index';

describe('Digital Twin Simulation Engine Core Unit Tests', () => {

  // Setup sample mock entities
  const mockProject: Project = {
    id: 'proj_1',
    name: 'Real Project Video',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: {
      tracks: [
        { id: 'track_1', name: 'Video 1', type: 'video' },
        { id: 'track_2', name: 'Audio 1', type: 'audio' },
      ],
      clips: [
        { id: 'clip_1', trackId: 'track_1', name: 'Intro', startFrame: 0, duration: 150, type: 'video', assetId: 'asset_video_1' },
        { id: 'clip_2', trackId: 'track_1', name: 'Sizzle', startFrame: 150, duration: 300, type: 'video', assetId: 'asset_video_2' },
      ],
    },
  };

  const mockWorkflows: Workflow[] = [
    {
      id: 'wf_1',
      name: 'Smart Montage Sequence',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step_1', name: 'Analyze audio track', type: 'script', config: {}, nextStepId: 'step_2' },
        { id: 'step_2', name: 'Cut video to beats', type: 'ai_task', config: {}, nextStepId: 'step_3' },
        { id: 'step_3', name: 'Apply color grade filter', type: 'transform', config: {} },
      ],
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockAssets = [
    { id: 'asset_video_1', name: 'intro.mp4', type: 'video', sizeMb: 45 },
    { id: 'asset_video_2', name: 'sizzle_reel.mov', type: 'video', sizeMb: 250 },
  ];

  test('Isolated Digital Twin - State isolation and immutability', async () => {
    const engine = new SimulationEngine();
    const twin = engine.createTwin(mockProject, mockWorkflows, [], mockAssets);

    // Verify isolation - modifying twin must NOT affect the original project
    await twin.executeOperation('timeline_edit', {
      action: 'move',
      clipId: 'clip_1',
      startFrame: 50,
    });

    const originalIntro = mockProject.timeline.clips.find((c: any) => c.id === 'clip_1');
    const simulatedIntro = twin.getProjectState().timeline.clips.find((c: any) => c.id === 'clip_1');

    assert.strictEqual(originalIntro.startFrame, 0); // Original is untouched!
    assert.strictEqual(simulatedIntro.startFrame, 50); // Simulated is updated!
    assert.strictEqual(twin.history.length, 1);
  });

  test('Rollback & Time Travel', async () => {
    const engine = new SimulationEngine();
    const twin = engine.createTwin(mockProject, mockWorkflows, [], mockAssets);

    // Execute multiple operations
    await twin.executeOperation('timeline_edit', { action: 'move', clipId: 'clip_1', startFrame: 10 });
    await twin.executeOperation('timeline_edit', { action: 'resize', clipId: 'clip_2', duration: 400 });
    await twin.executeOperation('variable_update', { name: 'bitrate', value: 5000 });

    assert.strictEqual(twin.history.length, 3);
    assert.strictEqual(twin.getProjectState().timeline.clips[0].startFrame, 10);
    assert.strictEqual(twin.getProjectState().timeline.clips[1].duration, 400);
    assert.strictEqual(twin.getVariables().find(v => v.name === 'bitrate')?.value, 5000);

    // Rollback last step (variable update)
    const rolled = twin.rollbackStep();
    assert.ok(rolled);
    assert.strictEqual(rolled.type, 'variable_update');
    assert.strictEqual(twin.history.length, 2);
    assert.strictEqual(twin.getVariables().find(v => v.name === 'bitrate'), undefined); // Reverted!
    assert.strictEqual(twin.getProjectState().timeline.clips[1].duration, 400); // Timeline edits preserved!

    // Time travel to step index 0 (the first move edit)
    twin.replayToStep(0);
    assert.strictEqual(twin.replayPointer, 0);
    assert.strictEqual(twin.getProjectState().timeline.clips[0].startFrame, 10);
    assert.strictEqual(twin.getProjectState().timeline.clips[1].duration, 300); // Reverted to default duration!
  });

  test('Parallel Simulations - Fully independent execution', async () => {
    const engine = new SimulationEngine();
    const twinA = engine.createTwin(mockProject);
    const twinB = engine.createTwin(mockProject);

    // Run parallel operations on separate twins
    await twinA.executeOperation('timeline_edit', { action: 'move', clipId: 'clip_1', startFrame: 100 });
    await twinB.executeOperation('timeline_edit', { action: 'move', clipId: 'clip_1', startFrame: 200 });

    assert.strictEqual(twinA.getProjectState().timeline.clips[0].startFrame, 100);
    assert.strictEqual(twinB.getProjectState().timeline.clips[0].startFrame, 200);
  });

  test('Predictive Simulation & Accuracy', async () => {
    const engine = new SimulationEngine();
    const twin = engine.createTwin(mockProject, [], [], mockAssets);

    // Run a render simulation step
    await twin.executeOperation('rendering', { preset: 'prores_422' });

    const result = await engine.runSimulation(twin);

    // Render duration, costs, complexity check
    assert.ok(result.predictions.performance.renderDurationMs > 0);
    assert.ok(result.predictions.cost.totalCost > 0);
    assert.strictEqual(result.predictions.timelineComplexity, 'low');

    // Create a larger simulation and check complexity progression
    const largeProject = { ...mockProject };
    largeProject.timeline = {
      tracks: Array.from({ length: 6 }, (_, i) => ({ id: `t_${i}`, name: `Track ${i}`, type: 'video' })),
      clips: Array.from({ length: 20 }, (_, i) => ({ id: `c_${i}`, name: `Clip ${i}`, startFrame: i * 10, duration: 100, type: 'video' })),
    };

    const largeTwin = engine.createTwin(largeProject, [], [], mockAssets);
    const largeResult = await engine.runSimulation(largeTwin);

    // Complexity must progress to medium/high
    assert.strictEqual(largeResult.predictions.timelineComplexity, 'medium');
    assert.ok(largeResult.predictions.performance.renderDurationMs > result.predictions.performance.renderDurationMs);
  });

  test('Safety Validation - Missing assets, broken tracks, invalid expressions, cyclic workflows', async () => {
    const engine = new SimulationEngine();

    // 1. Missing asset reference
    const brokenAssetProject: Project = {
      ...mockProject,
      timeline: {
        tracks: [{ id: 'track_1', name: 'Video 1', type: 'video' }],
        clips: [{ id: 'clip_1', trackId: 'track_1', name: 'Broken clip', startFrame: 0, duration: 100, type: 'video', assetId: 'nonexistent_asset' }],
      },
    };

    const twinAsset = engine.createTwin(brokenAssetProject, [], [], mockAssets);
    const resultAsset = await engine.runSimulation(twinAsset);
    assert.ok(resultAsset.validationIssues.some(issue => issue.category === 'missing_asset'));

    // 2. Broken track reference
    const brokenTrackProject: Project = {
      ...mockProject,
      timeline: {
        tracks: [{ id: 'track_1', name: 'Video 1', type: 'video' }],
        clips: [{ id: 'clip_1', trackId: 'invalid_track', name: 'Broken track', startFrame: 0, duration: 100, type: 'video' }],
      },
    };

    const twinTrack = engine.createTwin(brokenTrackProject, [], [], mockAssets);
    const resultTrack = await engine.runSimulation(twinTrack);
    assert.ok(resultTrack.validationIssues.some(issue => issue.category === 'broken_reference'));

    // 3. Cyclic Workflows
    const cyclicWorkflow: Workflow = {
      id: 'wf_cycle',
      name: 'Circular Loops',
      trigger: { type: 'manual' },
      steps: [
        { id: 'step_1', name: 'Step 1', type: 'script', config: {}, nextStepId: 'step_2' },
        { id: 'step_2', name: 'Step 2', type: 'loop', config: {}, nextStepId: 'step_1' }, // loop back!
      ],
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const twinWf = engine.createTwin(mockProject, [cyclicWorkflow], [], mockAssets);
    const resultWf = await engine.runSimulation(twinWf);
    assert.ok(resultWf.validationIssues.some(issue => issue.category === 'circular_workflow'));

    // 4. Invalid Expression
    const exprProject: Project = {
      ...mockProject,
      timeline: {
        tracks: [{ id: 'track_1', name: 'Video 1', type: 'video' }],
        clips: [{ id: 'clip_1', trackId: 'track_1', name: 'Expr clip', startFrame: 0, duration: 100, type: 'video', expression: 'this.__proto__.pollute()' }],
      },
    };

    const twinExpr = engine.createTwin(exprProject, [], [], mockAssets);
    const resultExpr = await engine.runSimulation(twinExpr);
    assert.ok(resultExpr.validationIssues.some(issue => issue.category === 'invalid_expression'));
  });

  test('Optimization Suggestions', async () => {
    const engine = new SimulationEngine();

    // Project with lots of tracks (triggers consolidated tracks tip)
    const manyTracksProject: Project = {
      ...mockProject,
      timeline: {
        tracks: Array.from({ length: 12 }, (_, i) => ({ id: `track_${i}`, name: `Track ${i}`, type: 'video' })),
        clips: [
          { id: 'clip_1', trackId: 'track_1', name: 'C1', startFrame: 0, duration: 100, type: 'video' },
        ],
      },
    };

    const twin = engine.createTwin(manyTracksProject, [], [], mockAssets);
    const result = await engine.runSimulation(twin);

    assert.ok(result.optimizationProposals.some(prop => prop.category === 'merge_layers'));
  });

  test('Plugin Extensibility - Custom adapters, prediction providers, validators, and strategies', async () => {
    const engine = new SimulationEngine();

    // 1. Custom Prediction Provider
    const customPredictionProvider: PredictionProvider = {
      id: 'custom_prov',
      name: 'Custom Provider',
      estimate: async (twin) => ({
        performance: { renderDurationMs: 99999 },
        cost: { totalCost: 150 },
      }),
    };
    engine.predictionService.registerProvider(customPredictionProvider);

    // 2. Custom Validator
    const customValidator: Validator = {
      id: 'custom_val',
      name: 'Custom Validator',
      validate: async (twin) => [
        { id: 'custom_issue', category: 'plugin_conflict', severity: 'error', message: 'Custom conflict detected!' },
      ],
    };
    engine.validationService.registerValidator(customValidator);

    // 3. Custom Strategy
    const customStrategy: OptimizationStrategy = {
      id: 'custom_strat',
      name: 'Custom Strategy',
      analyze: async (twin) => [
        { id: 'custom_prop', category: 'proxy_recommendations', title: 'Custom Proxy Rec', description: 'Desc', potentialSavings: { costReduction: 10, renderDurationReductionMs: 5000, memoryReductionMb: 50 }, effort: 'low' },
      ],
    };
    engine.optimizationService.registerStrategy(customStrategy);

    // 4. Custom Adapter
    const customAdapter: SimulationAdapter = {
      id: 'custom_adapter',
      name: 'Custom Adapter',
      supportedTypes: ['plugin_execution'],
      execute: async (twin, type, payload) => {
        return twin.executeOperation('plugin_execution', { hookName: 'custom_triggered' });
      },
    };
    engine.registerAdapter(customAdapter);

    const twin = engine.createTwin(mockProject, [], [], mockAssets);
    const result = await engine.runSimulation(twin, {
      id: 'scen_1',
      name: 'Scenario with Custom Plugin',
      description: 'Run customized step',
      steps: [{ type: 'plugin_execution', payload: {} }],
    });

    // Check custom predictions merged
    assert.strictEqual(result.predictions.performance.renderDurationMs, 99999);

    // Check custom validation issue merged
    assert.ok(result.validationIssues.some(issue => issue.message === 'Custom conflict detected!'));

    // Check custom optimization proposal merged
    assert.ok(result.optimizationProposals.some(prop => prop.title === 'Custom Proxy Rec'));

    // Check adapter executed custom payload successfully
    assert.ok(result.events.some(evt => evt.description.includes('custom_triggered')));
  });

  test('Large Projects Scaling', async () => {
    const engine = new SimulationEngine();

    // Construct a project with 100 clips
    const largeProject: Project = {
      id: 'proj_large_scale',
      name: 'Large Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: {
        tracks: Array.from({ length: 15 }, (_, i) => ({ id: `t_${i}`, name: `Track ${i}`, type: 'video' })),
        clips: Array.from({ length: 100 }, (_, i) => ({
          id: `c_${i}`,
          trackId: `t_${i % 15}`,
          name: `Clip ${i}`,
          startFrame: i * 50,
          duration: 120,
          type: 'video',
          sizeMb: 50,
        })),
      },
    };

    const start = Date.now();
    const twin = engine.createTwin(largeProject, [], [], mockAssets);
    const result = await engine.runSimulation(twin);
    const duration = Date.now() - start;

    assert.ok(duration < 250); // Simulation must be fast and complete in less than 250ms even with 100 clips!
    assert.strictEqual(result.predictions.timelineComplexity, 'high');
  });
});
