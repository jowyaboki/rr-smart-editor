import { describe, test } from 'node:test';
import assert from 'node:assert';
import { PerformanceBudgetManager, DEFAULT_BUDGET } from '../src/index';

describe('Performance Budget Core Unit Tests', () => {

  test('Validating clean metrics within budgets', () => {
    const manager = new PerformanceBudgetManager();
    const cleanMetrics = {
      coldStartupTimeMs: 120,
      warmStartupTimeMs: 25,
      memoryUsageMb: 90,
      renderLatencyMs: 8,
      bundleSizeBytes: 1024 * 30,
      initializationTimeMs: 15,
      playbackFps: 60,
      timelineFps: 59,
      cacheHitRate: 85,
    };

    const res = manager.evaluate(cleanMetrics);
    assert.strictEqual(res.budgetExceeded, false);
    assert.strictEqual(res.warnings.length, 0);
  });

  test('Detects and flags budget breaches and warnings', () => {
    const manager = new PerformanceBudgetManager({
      maxMemoryUsageMb: 100,
      minPlaybackFps: 55,
    });

    const badMetrics = {
      coldStartupTimeMs: 120,
      memoryUsageMb: 110, // Exceeds 100MB
      playbackFps: 50,    // Drops below 55 FPS
    };

    const res = manager.evaluate(badMetrics);
    assert.strictEqual(res.budgetExceeded, true);
    assert.ok(res.warnings.some((w) => w.includes('[BUDGET EXCEEDED] Memory Usage')));
    assert.ok(res.warnings.some((w) => w.includes('[BUDGET EXCEEDED] Playback FPS')));
  });

  test('Detects historical regressions', () => {
    const manager = new PerformanceBudgetManager();
    const regressiveMetrics = {
      coldStartupTimeMs: 140, // Within 150ms limit, but >15% higher than 100ms
      historicalStartupTimeMs: 100,
      memoryUsageMb: 110, // Within 120MB limit, but >20% higher than 80MB
      historicalMemoryMb: 80,
    };

    const res = manager.evaluate(regressiveMetrics);
    assert.strictEqual(res.budgetExceeded, true);
    assert.ok(res.warnings.some((w) => w.includes('[REGRESSION DETECTED] Cold startup')));
    assert.ok(res.warnings.some((w) => w.includes('[REGRESSION DETECTED] Memory Usage')));
  });
});
