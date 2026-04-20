import { describe, it, expect, beforeEach } from 'vitest';
import {
  cacheResponse,
  getCachedResponse,
  clearCache,
  getCacheSize,
} from '@/background/response-cache';

describe('response-cache', () => {
  beforeEach(() => {
    clearCache();
  });

  it('caches and retrieves a response', () => {
    cacheResponse({
      url: 'http://test.com/api',
      data: '{}',
      format: 'json',
      timestamp: '2026-01-01',
    });
    const cached = getCachedResponse('http://test.com/api');
    expect(cached).toBeDefined();
    expect(cached?.data).toBe('{}');
    expect(cached?.format).toBe('json');
  });

  it('returns undefined for uncached URL', () => {
    expect(getCachedResponse('http://notcached.com')).toBeUndefined();
  });

  it('returns previous response when overwriting', () => {
    cacheResponse({
      url: 'http://test.com',
      data: '{"v":1}',
      format: 'json',
      timestamp: '2026-01-01',
    });
    const prev = cacheResponse({
      url: 'http://test.com',
      data: '{"v":2}',
      format: 'json',
      timestamp: '2026-01-02',
    });
    expect(prev?.data).toBe('{"v":1}');
  });

  it('tracks cache size', () => {
    expect(getCacheSize()).toBe(0);
    cacheResponse({ url: 'http://a.com', data: '1', format: 'json', timestamp: '' });
    cacheResponse({ url: 'http://b.com', data: '2', format: 'yaml', timestamp: '' });
    expect(getCacheSize()).toBe(2);
  });

  it('evicts oldest entry when exceeding max', () => {
    for (let i = 0; i < 51; i++) {
      cacheResponse({ url: `http://test.com/${i}`, data: `${i}`, format: 'json', timestamp: '' });
    }
    expect(getCacheSize()).toBe(50);
    // First entry should have been evicted
    expect(getCachedResponse('http://test.com/0')).toBeUndefined();
    // Last entry should exist
    expect(getCachedResponse('http://test.com/50')).toBeDefined();
  });

  it('clears all entries', () => {
    cacheResponse({ url: 'http://a.com', data: '1', format: 'json', timestamp: '' });
    cacheResponse({ url: 'http://b.com', data: '2', format: 'json', timestamp: '' });
    clearCache();
    expect(getCacheSize()).toBe(0);
  });
});
