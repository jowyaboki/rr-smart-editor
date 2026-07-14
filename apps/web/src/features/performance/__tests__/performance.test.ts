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

describe('Performance & Scalability Framework Tests', () => {
  beforeEach(() => {
    CacheService.clear();
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
          updateProgress(i * 20);
          progressLog.push(i * 20);
          await SchedulerService.yieldToMainThread();
        }
      },
    );

    const status = SchedulerService.getTaskStatus(taskId);
    assert.ok(status);
    assert.strictEqual(status.name, 'Heavy Waveform Generator');

    // Wait for task to finish
    await new Promise((resolve) => setTimeout(resolve, 80));

    const finalStatus = SchedulerService.getTaskStatus(taskId);
    assert.ok(finalStatus);
    assert.strictEqual(finalStatus.status, 'completed');
    assert.strictEqual(finalStatus.progress, 100);
    assert.deepStrictEqual(progressLog, [20, 40, 60, 80, 100]);
  });

  test('BenchmarkRunner - run scale scenarios programmatically', async () => {
    // Run 100 clips scenario
    const report = await BenchmarkRunner.runScenario('Standard Test Scenario', 10, 10);

    assert.strictEqual(report.scenarioName, 'Standard Test Scenario');
    assert.strictEqual(report.clipCount, 100);
    assert.strictEqual(report.trackCount, 10);
    assert.ok(report.compositionBuildTimeMs >= 0);
    assert.ok(report.virtualizationTimeMs >= 0);
    assert.ok(report.fpsUnderLoad >= 30);
  });
});
