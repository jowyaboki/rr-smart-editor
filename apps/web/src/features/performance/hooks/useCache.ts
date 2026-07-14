import { useCallback } from 'react';
import { CacheService } from '../services/CacheService';
import { MetricsService } from '../services/MetricsService';

export const useCache = () => {
  /**
   * Retrieves an item from the cache, automatically recording cache hits and misses.
   */
  const getCached = useCallback(<T = any>(key: string): T | null => {
    const val = CacheService.get<T>(key);
    if (val !== null) {
      MetricsService.recordCacheHit();
    } else {
      MetricsService.recordCacheMiss();
    }
    return val;
  }, []);

  /**
   * Saves an item to cache with custom time-to-live.
   */
  const setCached = useCallback(<T = any>(key: string, value: T, ttlMs?: number): void => {
    CacheService.set<T>(key, value, ttlMs);
  }, []);

  /**
   * Evicts an item from cache.
   */
  const evict = useCallback((key: string): void => {
    CacheService.delete(key);
  }, []);

  return {
    getCached,
    setCached,
    evict,
    getStats: useCallback(() => CacheService.getStats(), []),
  };
};
