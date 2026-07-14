import { CacheEntry } from '@ai-video-editor/shared';

export class CacheService {
  private static cache = new Map<string, CacheEntry>();
  private static maxCacheSizeBytes = 50 * 1024 * 1024; // 50MB budget limit
  private static currentCacheSizeBytes = 0;

  /**
   * Puts an item in cache with a TTL (Time To Live).
   */
  public static set<T = any>(key: string, value: T, ttlMs: number = 300000): void {
    const serialized = JSON.stringify(value);
    const sizeBytes = serialized.length * 2; // Rough approximation of JS UTF-16 characters size

    // Ensure we do not overflow the cache limit
    this.ensureCapacity(sizeBytes);

    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
      sizeBytes,
    };

    this.cache.set(key, entry);
    this.currentCacheSizeBytes += sizeBytes;
  }

  /**
   * Retrieves an item from cache. Returns null if expired or missing.
   */
  public static get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Removes an entry from cache.
   */
  public static delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentCacheSizeBytes -= entry.sizeBytes;
      this.cache.delete(key);
    }
  }

  /**
   * Clears the cache completely.
   */
  public static clear(): void {
    this.cache.clear();
    this.currentCacheSizeBytes = 0;
  }

  /**
   * Gets stats on hit rates and size.
   */
  public static getStats() {
    return {
      entryCount: this.cache.size,
      currentSizeBytes: this.currentCacheSizeBytes,
      maxBudgetBytes: this.maxCacheSizeBytes,
      fillPercentage: Number(
        ((this.currentCacheSizeBytes / this.maxCacheSizeBytes) * 100).toFixed(1),
      ),
    };
  }

  /**
   * Evicts expired or oldest entries to fit new data size.
   */
  private static ensureCapacity(incomingSizeBytes: number): void {
    // 1. First remove expired entries
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.delete(key);
      }
    });

    // 2. If still over budget, evict oldest elements
    if (this.currentCacheSizeBytes + incomingSizeBytes <= this.maxCacheSizeBytes) return;

    const entries = Array.from(this.cache.values()).sort((a, b) => a.createdAt - b.createdAt);
    for (const entry of entries) {
      if (this.currentCacheSizeBytes + incomingSizeBytes <= this.maxCacheSizeBytes) {
        break;
      }
      this.delete(entry.key);
    }
  }
}
