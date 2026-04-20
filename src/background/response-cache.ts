import type { CachedResponse } from '@/shared/types';
import { MAX_CACHE_ENTRIES } from '@/shared/constants';

const cache = new Map<string, CachedResponse>();

export function cacheResponse(entry: CachedResponse): CachedResponse | undefined {
  const previous = cache.get(entry.url);
  cache.set(entry.url, entry);

  // LRU eviction
  if (cache.size > MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }

  return previous;
}

export function getCachedResponse(url: string): CachedResponse | undefined {
  return cache.get(url);
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheSize(): number {
  return cache.size;
}
