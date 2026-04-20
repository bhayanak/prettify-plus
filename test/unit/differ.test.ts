import { describe, it, expect } from 'vitest';
import { diffObjects } from '@/viewer/utils/differ';

describe('diffObjects', () => {
  it('detects no changes for identical objects', () => {
    const obj = { a: 1, b: 'hello' };
    const result = diffObjects(obj, { ...obj });
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
    expect(result.unchanged).toBe(2);
  });

  it('detects added properties', () => {
    const result = diffObjects({ a: 1 }, { a: 1, b: 2 });
    expect(result.added).toHaveLength(1);
    expect(result.added[0].path).toBe('$.b');
    expect(result.added[0].value).toBe(2);
  });

  it('detects removed properties', () => {
    const result = diffObjects({ a: 1, b: 2 }, { a: 1 });
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].path).toBe('$.b');
    expect(result.removed[0].value).toBe(2);
  });

  it('detects modified values', () => {
    const result = diffObjects({ a: 1 }, { a: 2 });
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].path).toBe('$.a');
    expect(result.modified[0].oldValue).toBe(1);
    expect(result.modified[0].newValue).toBe(2);
  });

  it('handles nested objects', () => {
    const old = { user: { name: 'Alice', age: 30 } };
    const curr = { user: { name: 'Alice', age: 31 } };
    const result = diffObjects(old, curr);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].path).toBe('$.user.age');
  });

  it('handles arrays', () => {
    const result = diffObjects([1, 2, 3], [1, 2, 4]);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].path).toBe('$[2]');
  });

  it('detects array length changes', () => {
    const result = diffObjects([1, 2], [1, 2, 3]);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].path).toBe('$[2]');
  });

  it('detects array shrinkage', () => {
    const result = diffObjects([1, 2, 3], [1, 2]);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].path).toBe('$[2]');
  });

  it('handles null to value', () => {
    const result = diffObjects(null, { a: 1 });
    expect(result.added).toHaveLength(1);
  });

  it('handles value to null', () => {
    const result = diffObjects({ a: 1 }, null);
    expect(result.removed).toHaveLength(1);
  });

  it('handles type changes', () => {
    const result = diffObjects({ a: '1' }, { a: 1 });
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].path).toBe('$.a');
  });

  it('handles both null', () => {
    const result = diffObjects(null, null);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });

  it('handles empty objects', () => {
    const result = diffObjects({}, {});
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });

  it('handles complex nested diff', () => {
    const old = { users: [{ name: 'Alice' }, { name: 'Bob' }] };
    const curr = { users: [{ name: 'Alice' }, { name: 'Charlie' }] };
    const result = diffObjects(old, curr);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].path).toBe('$.users[1].name');
  });
});
