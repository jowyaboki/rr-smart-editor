import { PreviewFrame } from '../types';

export class BufferService {
  private frameCache = new Map<number, PreviewFrame>();
  private maxCacheSize: number;
  private lookAheadCount: number = 15; // Prefetch frame count
  private evaluationLatencyHistory: number[] = [];

  constructor(maxCacheSize: number = 100) {
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Get pre-cached frame.
   */
  public getFrame(frameIndex: number): PreviewFrame | undefined {
    return this.frameCache.get(frameIndex);
  }

  /**
   * Insert evaluated frame into cache.
   * Evicts oldest frames if cache size limits are exceeded.
   */
  public setFrame(frameIndex: number, frame: PreviewFrame): void {
    if (this.frameCache.size >= this.maxCacheSize) {
      // Evict furthest frame from current index
      const keys = Array.from(this.frameCache.keys());
      let furthestKey = keys[0];
      let maxDist = -1;

      for (const k of keys) {
        const dist = Math.abs(k - frameIndex);
        if (dist > maxDist) {
          maxDist = dist;
          furthestKey = k;
        }
      }
      this.frameCache.delete(furthestKey);
    }

    this.frameCache.set(frameIndex, frame);
  }

  /**
   * Record evaluation latency to adaptively optimize buffering.
   */
  public recordLatency(ms: number): void {
    this.evaluationLatencyHistory.push(ms);
    if (this.evaluationLatencyHistory.length > 10) {
      this.evaluationLatencyHistory.shift();
    }

    // Adaptive buffering: if average latency is high (> 30ms), extend look-ahead window!
    const avg = this.getAverageLatency();
    if (avg > 30) {
      this.lookAheadCount = 30; // buffer more frames ahead for slow environments
    } else if (avg > 15) {
      this.lookAheadCount = 20;
    } else {
      this.lookAheadCount = 15;
    }
  }

  public getAverageLatency(): number {
    if (this.evaluationLatencyHistory.length === 0) return 0;
    const sum = this.evaluationLatencyHistory.reduce((a, b) => a + b, 0);
    return sum / this.evaluationLatencyHistory.length;
  }

  public getLookAheadCount(): number {
    return this.lookAheadCount;
  }

  /**
   * Triggers background pre-evaluation window calculation.
   * Returns list of frame indexes that are missing from cache and need pre-evaluation.
   */
  public getFramesToPrefetch(currentFrame: number, totalFrames: number): number[] {
    const prefetchList: number[] = [];

    for (let i = 1; i <= this.lookAheadCount; i++) {
      const target = currentFrame + i;
      if (target < totalFrames) {
        if (!this.frameCache.has(target)) {
          prefetchList.push(target);
        }
      }
    }

    return prefetchList;
  }

  public clear(): void {
    this.frameCache.clear();
    this.evaluationLatencyHistory = [];
    this.lookAheadCount = 15;
  }

  public getCacheSize(): number {
    return this.frameCache.size;
  }
}
