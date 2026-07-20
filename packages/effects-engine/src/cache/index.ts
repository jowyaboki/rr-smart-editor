export interface CacheEntry<T> {
  key: string;
  value: T;
  size: number; // in bytes or count
  lastAccessed: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private currentSize = 0;

  constructor(
    public readonly maxSize: number, // Maximum size in bytes or count
    private readonly onEvict?: (key: string, value: T) => void
  ) {}

  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccessed = Date.now();
      return entry.value;
    }
    return undefined;
  }

  public set(key: string, value: T, size: number = 1): void {
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Check if we need to evict entries to fit the new one
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      key,
      value,
      size,
      lastAccessed: Date.now(),
    });
    this.currentSize += size;
  }

  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      if (this.onEvict) {
        this.onEvict(entry.key, entry.value);
      }
      return this.cache.delete(key);
    }
    return false;
  }

  public clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.onEvict(key, entry.value);
      }
    }
    this.cache.clear();
    this.currentSize = 0;
  }

  public getSize(): number {
    return this.currentSize;
  }

  public getCount(): number {
    return this.cache.size;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
}

/**
 * Orchestrator managing GPU texture, frame, shader, and intermediate buffer caches.
 */
export class GPUCacheManager {
  // Texture Cache: Stores WebGLTexture or CanvasImageSource references (Size in bytes or count)
  public readonly textureCache = new LRUCache<any>(1024 * 1024 * 256, (key, value) => {
    // Perform cleanup/disposal on texture eviction if applicable
  });

  // Frame Cache: Stores fully rendered video/composition frames
  public readonly frameCache = new LRUCache<any>(100, (key, value) => {
    // Perform canvas or image data cleanups
  });

  // Shader Cache: Stores compiled WebGLProgram or WebGPUShaderModule references
  public readonly shaderCache = new LRUCache<any>(50, (key, value) => {
    // Perform WebGL deleteProgram cleanups
  });

  // Intermediate Buffer Cache: Stores temporary canvas or WebGLRenderbuffer render targets
  public readonly intermediateBufferCache = new LRUCache<any>(1024 * 1024 * 128, (key, value) => {
    // Perform buffer deletion cleanups
  });

  /**
   * Clears all caches managed by the system
   */
  public clearAll(): void {
    this.textureCache.clear();
    this.frameCache.clear();
    this.shaderCache.clear();
    this.intermediateBufferCache.clear();
  }
}
