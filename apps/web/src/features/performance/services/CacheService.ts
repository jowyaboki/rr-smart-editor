import { CacheEntry } from '@ai-video-editor/shared';

export interface CachePolicy {
  name: string;
  get<T>(key: string, entry: CacheEntry<T>): T | null;
  set<T>(key: string, entry: CacheEntry<T>, cache: Map<string, CacheEntry<any>>): void;
  onDelete(key: string): void;
}

// 1. LRU Cache Policy: tracks access times and updates order on hit
export class LRUCachePolicy implements CachePolicy {
  public name = 'LRU';
  private accessTimes = new Map<string, number>();
  private counter = 0; // Logical clock for 100% deterministic LRU ordering

  public get<T>(key: string, entry: CacheEntry<T>): T | null {
    this.accessTimes.set(key, ++this.counter);
    return entry.value;
  }

  public set<T>(key: string, entry: CacheEntry<T>, cache: Map<string, CacheEntry<any>>): void {
    this.accessTimes.set(key, ++this.counter);
  }

  public onDelete(key: string): void {
    this.accessTimes.delete(key);
  }

  public evict(incomingSize: number, currentSize: number, maxSize: number, cache: Map<string, CacheEntry<any>>, deleteFn: (k: string) => void): void {
    let localCurrentSize = currentSize;
    while (localCurrentSize + incomingSize > maxSize && cache.size > 0) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      cache.forEach((_, k) => {
        const t = this.accessTimes.get(k) || 0;
        if (t < oldestTime) {
          oldestTime = t;
          oldestKey = k;
        }
      });

      if (oldestKey) {
        const entry = cache.get(oldestKey);
        const entrySize = entry ? entry.sizeBytes : 0;
        deleteFn(oldestKey);
        localCurrentSize -= entrySize;
      } else {
        break;
      }
    }
  }
}

// 2. LFU Cache Policy: tracks frequency of access
export class LFUCachePolicy implements CachePolicy {
  public name = 'LFU';
  private frequencies = new Map<string, number>();

  public get<T>(key: string, entry: CacheEntry<T>): T | null {
    const f = this.frequencies.get(key) || 0;
    this.frequencies.set(key, f + 1);
    return entry.value;
  }

  public set<T>(key: string, entry: CacheEntry<T>, cache: Map<string, CacheEntry<any>>): void {
    this.frequencies.set(key, (this.frequencies.get(key) || 0) + 1);
  }

  public onDelete(key: string): void {
    this.frequencies.delete(key);
  }

  public evict(incomingSize: number, currentSize: number, maxSize: number, cache: Map<string, CacheEntry<any>>, deleteFn: (k: string) => void): void {
    let localCurrentSize = currentSize;
    while (localCurrentSize + incomingSize > maxSize && cache.size > 0) {
      let leastKey: string | null = null;
      let leastFreq = Infinity;

      cache.forEach((_, k) => {
        const f = this.frequencies.get(k) || 0;
        if (f < leastFreq) {
          leastFreq = f;
          leastKey = k;
        }
      });

      if (leastKey) {
        const entry = cache.get(leastKey);
        const entrySize = entry ? entry.sizeBytes : 0;
        deleteFn(leastKey);
        localCurrentSize -= entrySize;
      } else {
        break;
      }
    }
  }
}

// 3. TTL Cache Policy: simple expiration check on access
export class TTLCachePolicy implements CachePolicy {
  public name = 'TTL';

  public get<T>(key: string, entry: CacheEntry<T>): T | null {
    if (Date.now() > entry.expiresAt) {
      return null;
    }
    return entry.value;
  }

  public set<T>(key: string, entry: CacheEntry<T>, cache: Map<string, CacheEntry<any>>): void {}
  public onDelete(key: string): void {}
}

// 4. Memory Limited Policy: strictly respects a hard limit
export class MemoryLimitedPolicy implements CachePolicy {
  public name = 'Memory-Limited';

  public get<T>(key: string, entry: CacheEntry<T>): T | null {
    return entry.value;
  }

  public set<T>(key: string, entry: CacheEntry<T>, cache: Map<string, CacheEntry<any>>): void {}
  public onDelete(key: string): void {}

  public evict(incomingSize: number, currentSize: number, maxSize: number, cache: Map<string, CacheEntry<any>>, deleteFn: (k: string) => void): void {
    let localCurrentSize = currentSize;
    const sorted = Array.from(cache.values()).sort((a, b) => a.createdAt - b.createdAt);
    for (const entry of sorted) {
      if (localCurrentSize + incomingSize <= maxSize) break;
      deleteFn(entry.key);
      localCurrentSize -= entry.sizeBytes;
    }
  }
}

// 5. Hybrid Cache Policy: combines TTL with LRU and size eviction
export class HybridCachePolicy implements CachePolicy {
  public name = 'Hybrid';
  private lru = new LRUCachePolicy();

  public get<T>(key: string, entry: CacheEntry<T>): T | null {
    if (Date.now() > entry.expiresAt) {
      return null;
    }
    return this.lru.get(key, entry);
  }

  public set<T>(key: string, entry: CacheEntry<T>, cache: Map<string, CacheEntry<any>>): void {
    this.lru.set(key, entry, cache);
  }

  public onDelete(key: string): void {
    this.lru.onDelete(key);
  }

  public evict(incomingSize: number, currentSize: number, maxSize: number, cache: Map<string, CacheEntry<any>>, deleteFn: (k: string) => void): void {
    // 1. Evict expired entries first
    const now = Date.now();
    cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        deleteFn(key);
      }
    });

    // 2. If still over budget, use LRU eviction
    this.lru.evict(incomingSize, currentSize, maxSize, cache, deleteFn);
  }
}

export class CacheService {
  private static cache = new Map<string, CacheEntry>();
  private static maxCacheSizeBytes = 50 * 1024 * 1024; // 50MB budget limit
  private static currentCacheSizeBytes = 0;

  // Pluggable cache policy
  private static activePolicy: CachePolicy = new HybridCachePolicy();

  public static setPolicy(policy: 'lru' | 'lfu' | 'ttl' | 'memory' | 'hybrid'): void {
    switch (policy) {
      case 'lru':
        this.activePolicy = new LRUCachePolicy();
        break;
      case 'lfu':
        this.activePolicy = new LFUCachePolicy();
        break;
      case 'ttl':
        this.activePolicy = new TTLCachePolicy();
        break;
      case 'memory':
        this.activePolicy = new MemoryLimitedPolicy();
        break;
      case 'hybrid':
      default:
        this.activePolicy = new HybridCachePolicy();
        break;
    }
  }

  public static getActivePolicyName(): string {
    return this.activePolicy.name;
  }

  /**
   * Puts an item in cache with a TTL (Time To Live).
   */
  public static set<T = any>(key: string, value: T, ttlMs: number = 300000): void {
    const serialized = JSON.stringify(value);
    const sizeBytes = serialized.length * 2; // rough UTF-16 approximation

    // Evict if over capacity
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
    this.activePolicy.set(key, entry, this.cache);
  }

  /**
   * Retrieves an item from cache. Returns null if expired or missing.
   */
  public static get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const val = this.activePolicy.get<T>(key, entry);
    if (val === null) {
      this.delete(key);
      return null;
    }

    return val;
  }

  /**
   * Removes an entry from cache.
   */
  public static delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentCacheSizeBytes -= entry.sizeBytes;
      this.activePolicy.onDelete(key);
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
   * Evicts based on current pluggable policy.
   */
  private static ensureCapacity(incomingSizeBytes: number): void {
    const policy = this.activePolicy;

    if (policy instanceof LRUCachePolicy) {
      policy.evict(incomingSizeBytes, this.currentCacheSizeBytes, this.maxCacheSizeBytes, this.cache, (k) => this.delete(k));
    } else if (policy instanceof LFUCachePolicy) {
      policy.evict(incomingSizeBytes, this.currentCacheSizeBytes, this.maxCacheSizeBytes, this.cache, (k) => this.delete(k));
    } else if (policy instanceof MemoryLimitedPolicy) {
      policy.evict(incomingSizeBytes, this.currentCacheSizeBytes, this.maxCacheSizeBytes, this.cache, (k) => this.delete(k));
    } else if (policy instanceof HybridCachePolicy) {
      policy.evict(incomingSizeBytes, this.currentCacheSizeBytes, this.maxCacheSizeBytes, this.cache, (k) => this.delete(k));
    } else {
      // Default fallback
      const now = Date.now();
      this.cache.forEach((entry, key) => {
        if (now > entry.expiresAt) {
          this.delete(key);
        }
      });
      while (this.currentCacheSizeBytes + incomingSizeBytes > this.maxCacheSizeBytes && this.cache.size > 0) {
        const oldestKey = Array.from(this.cache.keys())[0];
        if (oldestKey) {
          this.delete(oldestKey);
        } else {
          break;
        }
      }
    }
  }
}
