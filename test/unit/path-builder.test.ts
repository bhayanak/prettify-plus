import { describe, it, expect } from 'vitest';
import { buildJSONPath, buildXPath, parseJSONPath } from '@/viewer/utils/path-builder';

describe('buildJSONPath', () => {
  it('builds root path', () => {
    expect(buildJSONPath([])).toBe('$');
  });

  it('builds simple property path', () => {
    expect(buildJSONPath(['users'])).toBe('$.users');
  });

  it('builds nested property path', () => {
    expect(buildJSONPath(['users', 0, 'name'])).toBe('$.users[0].name');
  });

  it('builds array-only path', () => {
    expect(buildJSONPath([0, 1])).toBe('$[0][1]');
  });

  it('builds deeply nested path', () => {
    expect(buildJSONPath(['a', 'b', 'c', 'd'])).toBe('$.a.b.c.d');
  });

  it('handles mixed segments', () => {
    expect(buildJSONPath(['items', 2, 'tags', 0])).toBe('$.items[2].tags[0]');
  });
});

describe('buildXPath', () => {
  it('builds root path', () => {
    expect(buildXPath([])).toBe('/');
  });

  it('builds simple element path', () => {
    expect(buildXPath(['root'])).toBe('/root');
  });

  it('builds path with index (1-based)', () => {
    expect(buildXPath(['root', 'users', 'user', 0])).toBe('/root/users/user[1]');
  });

  it('builds nested path', () => {
    expect(buildXPath(['a', 'b', 'c'])).toBe('/a/b/c');
  });
});

describe('parseJSONPath', () => {
  it('parses root path', () => {
    expect(parseJSONPath('$')).toEqual([]);
  });

  it('parses simple property', () => {
    expect(parseJSONPath('$.users')).toEqual(['users']);
  });

  it('parses nested path with array index', () => {
    expect(parseJSONPath('$.users[0].name')).toEqual(['users', 0, 'name']);
  });

  it('parses deep path', () => {
    expect(parseJSONPath('$.a.b.c.d')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('parses array-only path', () => {
    expect(parseJSONPath('$[0][1]')).toEqual([0, 1]);
  });
});
