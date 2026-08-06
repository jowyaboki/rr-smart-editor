import { describe, test, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Mock performance and globals
before(() => {
  global.performance = {
    now: () => Date.now(),
  } as any;
});

import { VirtualizationService } from '../services/VirtualizationService.ts';
import { CacheService } from '../services/CacheService.ts';
import { SchedulerService } from '../services/SchedulerService.ts';
import { BenchmarkRunner } from '../services/BenchmarkRunner.ts';
import { ClipPool, FrameBufferPool, GeometryPool } from '../services/ObjectPool.ts';

describe('Performance & Scalability Framework Tests', () => {
  beforeEach(() => {
    CacheService.clear();
    CacheService.setPolicy('hybrid'); // reset to default policy
  });

  test('VirtualizationService - horizontal and vertical timeline boundaries', () => {
    // Generate 50 tracks with 10 clips each = 500 clips total
    const tracks: any[] = [];
    for (let t = 0; t < 50; t++) {
      const clips: any[] = [];
      for (let c = 0; c < 10; c++) {
        clips.push({
          id: `clip_${t}_${c}`,
          start: c * 100, // clip starts at 0, 100, 200...
          duration: 80,
        });
      }
      tracks.push({ id: `track_${t}`, clips });
    }

    // Container showing vertical offset scroll of 120px (track 2 onwards) and horizontal window from frame 150 to 350
    const bounds = {
      scrollTop: 120, // starts around track 2
      scrollLeft: 150, // frames scroll offset
      viewportWidth: 200, // window width
      viewportHeight: 120, // fits exactly 2 tracks of height 60
      totalTracksCount: 50,
    };

    const results = VirtualizationService.calculateVisibility({
      bounds,
      tracks,
      zoom: 1.0,
    });

    // 1. Should save massive rendering resources (expecting savings > 80%)
    assert.ok(results.virtualizationSavingsPercentage > 80);

    // 2. Visible track indices should contain indices around track 1, 2, 3, 4
    assert.ok(results.visibleTrackIndices.includes(2));
    assert.ok(results.visibleTrackIndices.includes(3));

    // 3. Clip horizontal intersections check (clip starts outside horizontal buffer shouldn't be in visible range)
    const outOfBoundsClipId = 'clip_2_9'; // starts at 900, viewport is at 150-350
    assert.strictEqual(results.visibleClipIds.has(outOfBoundsClipId), false);
  });

  test('CacheService - setting, getting, and size eviction limits', () => {
    // 1. Normal set and get
    CacheService.set('key-1', { data: 'my-thumbnail' }, 60000);
    const cached = CacheService.get('key-1');
    assert.ok(cached);
    assert.strictEqual(cached.data, 'my-thumbnail');

    // 2. Expiration boundary
    CacheService.set('key-expired', 'expired-waveform', -1000); // negative TTL is expired on creation
    const expired = CacheService.get('key-expired');
    assert.strictEqual(expired, null);

    // 3. Size-based eviction
    // Override max budget to a very small size (100 bytes) for testing eviction
    (CacheService as any).maxCacheSizeBytes = 100;

    CacheService.set('big-entry-1', 'a'.repeat(30)); // length 30 characters ~ 60 bytes
    CacheService.set('big-entry-2', 'b'.repeat(30)); // length 30 characters ~ 60 bytes. Total is now 120 bytes > 100 budget!

    // The older 'big-entry-1' should have been evicted to make room for 'big-entry-2'
    const evicted = CacheService.get('big-entry-1');
    const preserved = CacheService.get('big-entry-2');

    assert.strictEqual(evicted, null);
    assert.ok(preserved);

    // Restore normal size budget
    (CacheService as any).maxCacheSizeBytes = 50 * 1024 * 1024;
  });

  test('CacheService - pluggable policies (LRU, LFU, TTL)', () => {
    // 1. Test LRU Policy explicitly
    CacheService.setPolicy('lru');
    (CacheService as any).maxCacheSizeBytes = 120; // Enough for 2 entries of length 25 (54 bytes each)

    CacheService.set('key-lru-1', 'a'.repeat(25)); // 54 bytes
    CacheService.set('key-lru-2', 'b'.repeat(25)); // 54 bytes

    // Access key-lru-1 to make it the most recently used
    CacheService.get('key-lru-1');

    // Add key-lru-3, which breaches budget. Since key-lru-1 was accessed, key-lru-2 should be evicted!
    CacheService.set('key-lru-3', 'c'.repeat(25)); // 54 bytes

    assert.strictEqual(
      CacheService.get('key-lru-2'),
      null,
      'LRU evicted least-recently accessed key',
    );
    assert.ok(CacheService.get('key-lru-1'), 'LRU preserved recently accessed key');

    // 2. Test LFU Policy explicitly
    CacheService.clear();
    CacheService.setPolicy('lfu');
    (CacheService as any).maxCacheSizeBytes = 120;

    CacheService.set('key-lfu-1', 'a'.repeat(25)); // 54 bytes
    CacheService.set('key-lfu-2', 'b'.repeat(25)); // 54 bytes

    // Frequently access key-lfu-2
    CacheService.get('key-lfu-2');
    CacheService.get('key-lfu-2');

    // Add key-lfu-3. Since key-lfu-1 has lower access frequency, it should be evicted!
    CacheService.set('key-lfu-3', 'c'.repeat(25));

    assert.strictEqual(
      CacheService.get('key-lfu-1'),
      null,
      'LFU evicted least-frequently accessed key',
    );
    assert.ok(CacheService.get('key-lfu-2'), 'LFU preserved frequently accessed key');

    // Reset budgets
    (CacheService as any).maxCacheSizeBytes = 50 * 1024 * 1024;
  });

  test('Object Pools - Clip, FrameBuffer, and Geometry recycling characteristics', () => {
    // 1. Clip Pool
    ClipPool.clear();
    const clip1 = ClipPool.acquire('clip_id_1', 'tr1', 'Name', 50, 150, 'video');
    assert.strictEqual(clip1.id, 'clip_id_1');
    assert.strictEqual(clip1.startFrame, 50);

    ClipPool.release(clip1);
    assert.strictEqual(ClipPool.getPoolSize(), 1);

    const clip2 = ClipPool.acquire('clip_id_2', 'tr2', 'Other', 200, 300, 'audio');
    // It should recycle the object reference!
    assert.strictEqual(clip2, clip1, 'ClipPool successfully recycled the object instance');
    assert.strictEqual(clip2.id, 'clip_id_2');

    // 2. Frame Buffer Pool
    FrameBufferPool.clear();
    const buf1 = FrameBufferPool.acquire(1024);
    assert.strictEqual(buf1.length, 1024);
    buf1[0] = 255;

    FrameBufferPool.release(buf1);
    const buf2 = FrameBufferPool.acquire(1024);
    assert.strictEqual(buf2, buf1, 'FrameBufferPool recycled typed array instance');
    assert.strictEqual(buf2[0], 0, 'FrameBufferPool reset/filled recycled array with zeros');

    // 3. Geometry Pool
    GeometryPool.clear();
    const geom1 = GeometryPool.acquire(10, 20, 100, 200);
    assert.strictEqual(geom1.x, 10);

    GeometryPool.release(geom1);
    const geom2 = GeometryPool.acquire(50, 60, 300, 400);
    assert.strictEqual(geom2, geom1, 'GeometryPool recycled the geometry rect instance');
    assert.strictEqual(geom2.x, 50);
  });

  test('SchedulerService - cancellable asynchronous background thread tasks', async () => {
    let progressLog: number[] = [];
    let wasCancelledInLoop = false;

    // A background task divided into chunks
    const taskId = SchedulerService.enqueueTask(
      'Heavy Waveform Generator',
      async (updateProgress, isCancelled) => {
        for (let i = 1; i <= 5; i++) {
          if (isCancelled()) {
            wasCancelledInLoop = true;
            break;
          }
          progressLog.push(i * 20);
          updateProgress(i * 20);
          await SchedulerService.yieldToMainThread();
        }
      },
    );

    const initialStatus = SchedulerService.getTaskStatus(taskId);
    assert.ok(initialStatus);
    assert.strictEqual(initialStatus.name, 'Heavy Waveform Generator');

    // Yield to let the microtask run
    await new Promise((r) => setTimeout(r, 100));

    const finalStatus = SchedulerService.getTaskStatus(taskId);
    assert.ok(finalStatus);
    assert.strictEqual(finalStatus.status, 'completed');
    assert.strictEqual(finalStatus.progress, 100);
    assert.deepStrictEqual(progressLog, [20, 40, 60, 80, 100]);
  });

  test('BenchmarkRunner - run scale scenarios programmatically', async () => {
    const report = await BenchmarkRunner.runScenario('Test scale', 5, 10);
    assert.strictEqual(report.scenarioName, 'Test scale');
    assert.strictEqual(report.clipCount, 50);
    assert.ok(report.compositionBuildTimeMs >= 0);
  });
});
