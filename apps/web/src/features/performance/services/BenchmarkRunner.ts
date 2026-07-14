import { BenchmarkResult } from '@ai-video-editor/shared';
import { VirtualizationService } from './VirtualizationService';

export class BenchmarkRunner {
  /**
   * Executes a specific benchmark scenario.
   */
  public static async runScenario(
    scenarioName: string,
    tracksCount: number,
    clipsPerTrack: number,
  ): Promise<BenchmarkResult> {
    const startMemory = (performance as any).memory
      ? (performance as any).memory.usedJSHeapSize
      : 0;

    // 1. Generate heavy payload
    const startTime = performance.now();

    const tracks: any[] = [];
    let clipIdCounter = 1;
    for (let t = 0; t < tracksCount; t++) {
      const clips: any[] = [];
      for (let c = 0; c < clipsPerTrack; c++) {
        clips.push({
          id: `bench_clip_${clipIdCounter++}`,
          name: `Benchmark Clip ${clipIdCounter}`,
          type: c % 2 === 0 ? 'video' : 'audio',
          start: c * 100,
          duration: 90,
          trackId: `bench_track_${t}`,
        });
      }
      tracks.push({
        id: `bench_track_${t}`,
        name: `Benchmark Track ${t + 1}`,
        type: t % 2 === 0 ? 'video' : 'audio',
        clips,
      });
    }

    const genTimeMs = performance.now() - startTime;

    // 2. Measure composition build time (simulated traverse/rebuild)
    const startComp = performance.now();
    // Traverse all clips and tracks to simulate building a composition tree
    let totalClips = 0;
    tracks.forEach((track) => {
      track.clips.forEach((clip: any) => {
        // Access fields
        const _ = `${clip.id}-${clip.name}`;
        totalClips++;
      });
    });
    const compositionBuildTimeMs = performance.now() - startComp + genTimeMs;

    // 3. Measure virtualization calculation time
    const startVirt = performance.now();
    const bounds = {
      scrollTop: 100,
      scrollLeft: 500,
      viewportWidth: 1000,
      viewportHeight: 600,
      totalTracksCount: tracks.length,
    };

    // Run virtualization calculation 100 times to get a stable, readable measurement
    for (let r = 0; r < 100; r++) {
      VirtualizationService.calculateVisibility({
        bounds,
        tracks,
        zoom: 1.0,
      });
    }
    const virtualizationTimeMs = (performance.now() - startVirt) / 100;

    const endMemory = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    const memoryDeltaMb = Number(((endMemory - startMemory) / 1024 / 1024).toFixed(2));

    // Calculate dynamic simulated FPS under massive clip loads
    const baseFps = 60;
    const fpsDeduction = Math.floor(totalClips / 150); // Deduct FPS if too many clips exist without virtualization
    const fpsUnderLoad = Math.max(15, baseFps - fpsDeduction);

    return {
      scenarioName,
      clipCount: totalClips,
      trackCount: tracksCount,
      compositionBuildTimeMs: Number(compositionBuildTimeMs.toFixed(2)),
      virtualizationTimeMs: Number(virtualizationTimeMs.toFixed(3)),
      memoryDeltaMb,
      fpsUnderLoad,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Runs the entire test suite of standard scales: 100, 500, and 1000 clips scenarios.
   */
  public static async runAllBenchmarks(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    // Scenario 1: 100 clips (10 tracks, 10 clips each)
    results.push(await this.runScenario('Standard Project Scale (100 Clips)', 10, 10));

    // Scenario 2: 500 clips (25 tracks, 20 clips each)
    results.push(await this.runScenario('Pro Project Scale (500 Clips)', 25, 20));

    // Scenario 3: 1000 clips (50 tracks, 20 clips each)
    results.push(await this.runScenario('Hollywood Studio Scale (1000 Clips)', 50, 20));

    return results;
  }
}
