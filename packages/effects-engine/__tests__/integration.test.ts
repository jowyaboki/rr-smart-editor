import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  IntegrationService,
  EngineRegistry,
  DependencyResolver,
  EventBridge,
  LifecycleManager,
} from '../../apps/web/src/core/integration';

describe('RR Smart Editor Core Integration Layer Unit Tests', () => {

  test('Registered Engines & Topological Order Resolver', () => {
    const service = new IntegrationService();
    const engines = service.registry.listEngines();

    // Verify all 15 core engines are registered correctly
    assert.strictEqual(engines.length, 15);

    // Verify topological order resolver holds leaf-to-root dependencies
    const resolver = new DependencyResolver();
    const sorted = resolver.resolveInitializationOrder(engines);

    assert.strictEqual(sorted.length, 15);

    // Variable Engine must be sorted before Expression Engine (which depends on it)
    const varIdx = sorted.findIndex(e => e.name === 'Variable Engine');
    const expIdx = sorted.findIndex(e => e.name === 'Expression Engine');
    assert.ok(varIdx < expIdx);
  });

  test('EventBridge Routing without Tight Tight-coupling', async () => {
    const bridge = new EventBridge();
    let variableEvaluated = false;

    // Subscribe to custom re-evaluate trigger
    bridge.subscribe('ExpressionsEvaluate', (payload) => {
      variableEvaluated = true;
      assert.strictEqual(payload.key, 'globalOpacity');
      assert.strictEqual(payload.value, 0.85);
    });

    // Simulate direct decoupled event emission
    bridge.publish('ExpressionsEvaluate', { key: 'globalOpacity', value: 0.85 });

    // Await async queue execution
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.strictEqual(variableEvaluated, true);
  });

  test('Safe Lifecycle Teardowns and Restarts', async () => {
    const registry = new EngineRegistry();
    const manager = new LifecycleManager(registry);

    let initCalled = false;
    let disposeCalled = false;

    registry.registerEngine({
      name: 'Mock Timeline',
      version: '1.0.0',
      dependencies: [],
      status: 'idle',
      health: 'healthy',
      initialize: async () => { initCalled = true; },
      dispose: async () => { disposeCalled = true; },
    });

    // Verify state transition: idle -> initialized
    await manager.initializeAll();
    assert.strictEqual(initCalled, true);
    assert.strictEqual(registry.getEngine('Mock Timeline')?.status, 'initialized');

    // Verify state transition: initialized -> disposed
    await manager.disposeAll();
    assert.strictEqual(disposeCalled, true);
    assert.strictEqual(registry.getEngine('Mock Timeline')?.status, 'disposed');
  });

  test('Failure Recovery during Initialization Blockers', async () => {
    const registry = new EngineRegistry();
    const manager = new LifecycleManager(registry);

    registry.registerEngine({
      name: 'Broken Audio Engine',
      version: '1.0.0',
      dependencies: [],
      status: 'idle',
      health: 'healthy',
      initialize: async () => {
        throw new Error('HARDWARE_FAILURE');
      },
    });

    // A fail in initialization should mark health unhealthy and carry errors without crashing app state
    await assert.rejects(async () => {
      await manager.initializeAll();
    }, / Broken Audio Engine/);

    const bEngine = registry.getEngine('Broken Audio Engine');
    assert.strictEqual(bEngine?.health, 'unhealthy');
    assert.strictEqual(bEngine?.error, 'HARDWARE_FAILURE');
  });
});
