import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  PackageManager,
} from '../src/index';

import {
  RRClient,
} from '@ai-video-editor/public-sdk';

describe('Backward Compatibility & Performance Certification (Phase 5 & 6)', () => {

  test('Existing v1.0 editor clients continue to open, edit, render and export correctly', async () => {
    // 1. Backward compatibility check with v1.0 specifications
    const client = new RRClient({ apiKey: 'rr_live_validKey_999' });

    // Open/list projects
    const projects = await client.getProjects();
    assert.strictEqual(projects.success, true);
    assert.strictEqual(projects.projects[0].name, 'Broadway Promo Video');

    // Edit/retrieve timeline
    const timeline = await client.getTimeline('proj_01');
    assert.strictEqual(timeline.success, true);

    // Trigger cluster renders & export
    const render = await client.triggerRender(timeline.timeline);
    assert.strictEqual(render.success, true);

    const status = await client.getRenderStatus(render.jobId);
    assert.strictEqual(status.status, 'completed');
  });

  test('Performance Metrics overhead is verified and small', async () => {
    const manager = new PackageManager();

    // 1. Startup impact tracking
    const tStart = performance.now();
    const mockService = new PackageManager();
    const startupImpact = performance.now() - tStart;
    assert.ok(startupImpact < 50); // startup should execute under 50ms in memory

    // 2. Memory impact profiling
    const memStart = process.memoryUsage().heapUsed;
    const instancesList: any[] = [];
    for (let i = 0; i < 100; i++) {
      instancesList.push(new PackageManager());
    }
    const memEnd = process.memoryUsage().heapUsed;
    const perInstanceHeap = (memEnd - memStart) / 100;
    assert.ok(perInstanceHeap < 102400); // memory footprint per manager is less than 100KB

    // 3. Installation time
    const sampleManifest = {
      id: 'perf-test-ext',
      name: 'perf-test',
      displayName: 'Perf Test Plugin',
      description: 'Performance benchmarking',
      version: '1.0.0',
      author: 'Benchmark',
      category: 'plugin' as const,
      editorVersion: '1.0.0',
      engineVersion: '1.0.0',
      permissions: ['ai' as const],
      activationEvents: [],
      entry: 'index.js',
    };
    manager.signExtension(sampleManifest);

    const tInstallStart = performance.now();
    await manager.installPackage(sampleManifest, async () => true);
    const installationTime = performance.now() - tInstallStart;
    assert.ok(installationTime < 25); // installation should resolve in less than 25ms

    // 4. Plugin load/enable time
    const tLoadStart = performance.now();
    manager.enablePackage('perf-test-ext');
    const pluginLoadTime = performance.now() - tLoadStart;
    assert.ok(pluginLoadTime < 10); // enabling should resolve in less than 10ms

    // 5. Marketplace response time
    const tFetchStart = performance.now();
    const meta = await manager.fetchOnlineMarketplaceMetadata('perf-test-ext');
    const marketplaceResponseTime = performance.now() - tFetchStart;
    assert.ok(marketplaceResponseTime < 15); // metadata fetch takes less than 15ms
  });
});
