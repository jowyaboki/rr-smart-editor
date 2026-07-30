import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  globalPlatformKernel,
  PlatformModule,
  PlatformService,
  PlatformContext,
} from '../src/index';

describe('Unified Platform Kernel Core Unit & Integration Tests', () => {
  const mockContext: PlatformContext = {
    kernelId: 'kernel_prod_01',
    env: 'production',
    startTime: new Date().toISOString(),
    configuration: {
      global: {},
      workspace: {},
      moduleOverrides: {},
    },
  };

  test('DependencyResolver correctly resolves topological startup order and detects cycles', () => {
    const resolver = globalPlatformKernel.dependencyResolver;

    const normalNodes = [
      { id: 'module_a', dependencies: ['module_b'] },
      { id: 'module_b', dependencies: [] },
      { id: 'module_c', dependencies: ['module_a'] },
    ];

    const graph1 = resolver.resolve(normalNodes);
    assert.strictEqual(graph1.hasCycles, false);
    assert.deepStrictEqual(graph1.evaluationOrder, ['module_b', 'module_a', 'module_c']);

    // Cyclic nodes
    const cyclicNodes = [
      { id: 'module_x', dependencies: ['module_y'] },
      { id: 'module_y', dependencies: ['module_x'] },
    ];

    const graph2 = resolver.resolve(cyclicNodes);
    assert.strictEqual(graph2.hasCycles, true);
  });

  test('ModuleRegistry and ServiceRegistry mappings and singletons lifetimes', () => {
    const registry = globalPlatformKernel.serviceRegistry;

    const mockService: PlatformService = {
      descriptor: {
        id: 'service_timeline',
        interfaceName: 'TimelineEngine',
        implementationClass: 'VirtualTimeline',
        isSingleton: true,
        scope: 'global',
      },
      async initialize(ctx) {},
    };

    registry.registerService(mockService);

    const retrieved = registry.getService<PlatformService>('service_timeline');
    assert.strictEqual(retrieved?.descriptor.implementationClass, 'VirtualTimeline');
    assert.strictEqual(retrieved?.descriptor.isSingleton, true);
  });

  test('Central BootstrapManager coordinates startup ordering and diagnostics profiling', async () => {
    const engine = globalPlatformKernel;

    // Register modules
    const m1: PlatformModule = {
      manifest: {
        id: 'engine_media',
        name: 'Media Pipeline',
        version: '1.0.0',
        dependencies: [],
        capabilities: ['media-proxy-generation'],
        priority: 'CORE',
      },
      state: 'Created',
      services: [],
      async initialize(ctx) {},
      async start(ctx) {},
      async stop(ctx) {},
    };

    const m2: PlatformModule = {
      manifest: {
        id: 'engine_renders',
        name: 'Render Pipeline',
        version: '1.0.0',
        dependencies: ['engine_media'],
        capabilities: ['composition-frame-splitting'],
        priority: 'BACKGROUND',
      },
      state: 'Created',
      services: [],
      async initialize(ctx) {},
      async start(ctx) {},
      async stop(ctx) {},
    };

    engine.moduleRegistry.registerModule(m1);
    engine.moduleRegistry.registerModule(m2);

    await engine.bootstrapManager.bootstrap(mockContext);

    // Verify correct topological states
    assert.strictEqual(m1.state, 'Running');
    assert.strictEqual(m2.state, 'Running');

    const timeline = engine.diagnosticsManager.getDiagnosticsTimeline();
    assert.ok(timeline.length > 0);
    assert.ok(timeline.some((e) => e.task.includes("Bootstrap Module 'Media Pipeline'")));

    const status = engine.healthManager.getHealthStatus();
    assert.strictEqual(status.status, 'healthy');
    assert.strictEqual(status.moduleStatuses['engine_media'], 'Running');
  });

  test('Strict 5-Phase Sequential Startup Priority Boot Sequence', async () => {
    const engine = globalPlatformKernel;
    const bootSequence: string[] = [];

    const coreModule: PlatformModule = {
      manifest: {
        id: 'boot_core',
        name: 'Core System',
        version: '1.0.0',
        dependencies: [],
        capabilities: [],
        priority: 'CORE',
      },
      state: 'Created',
      services: [],
      async initialize(ctx) {},
      async start(ctx) {
        bootSequence.push('CORE_START');
      },
      async stop(ctx) {},
    };

    const bgModule: PlatformModule = {
      manifest: {
        id: 'boot_bg',
        name: 'Background System',
        version: '1.0.0',
        dependencies: [],
        capabilities: [],
        priority: 'BACKGROUND',
      },
      state: 'Created',
      services: [],
      async initialize(ctx) {},
      async start(ctx) {
        bootSequence.push('BACKGROUND_START');
      },
      async stop(ctx) {},
    };

    const optModule: PlatformModule = {
      manifest: {
        id: 'boot_opt',
        name: 'Optional Copilot',
        version: '1.0.0',
        dependencies: [],
        capabilities: [],
        priority: 'OPTIONAL',
      },
      state: 'Created',
      services: [],
      async initialize(ctx) {},
      async start(ctx) {
        bootSequence.push('OPTIONAL_START');
      },
      async stop(ctx) {},
    };

    engine.moduleRegistry.registerModule(coreModule);
    engine.moduleRegistry.registerModule(bgModule);
    engine.moduleRegistry.registerModule(optModule);

    await engine.bootstrapManager.bootstrap(mockContext);

    // Assert strict ordering of startup phases: CORE -> BACKGROUND -> OPTIONAL
    assert.deepStrictEqual(bootSequence, ['CORE_START', 'BACKGROUND_START', 'OPTIONAL_START']);

    const timeline = engine.diagnosticsManager.getDiagnosticsTimeline();
    assert.ok(timeline.some((e) => e.task.includes('Complete Phase CORE Bootstrap')));
    assert.ok(timeline.some((e) => e.task.includes('Complete Phase BACKGROUND Bootstrap')));
    assert.ok(timeline.some((e) => e.task.includes('Complete Phase OPTIONAL Bootstrap')));
  });

  test('Hot restart and clean shutdowns lifecycle cycles', async () => {
    const engine = globalPlatformKernel;

    await engine.bootstrapManager.shutdown(mockContext);

    const status = engine.healthManager.getHealthStatus();
    assert.strictEqual(status.moduleStatuses['engine_media'], 'Disposed');
  });
});
