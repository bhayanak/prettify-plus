import type { DiffResult } from '@/shared/types';

/**
 * Deep diff between two parsed structures.
 * Returns added, removed, and modified paths.
 */
export function diffObjects(oldObj: unknown, newObj: unknown, path = '$'): DiffResult {
  const result: DiffResult = {
    added: [],
    removed: [],
    modified: [],
    unchanged: 0,
  };

  deepDiff(oldObj, newObj, path, result);
  return result;
}

function deepDiff(oldVal: unknown, newVal: unknown, path: string, result: DiffResult): void {
  // Both null/undefined
  if (oldVal === newVal) {
    if (isPrimitive(oldVal)) {
      result.unchanged++;
    }
    return;
  }

  // One is null/undefined
  if (oldVal === null || oldVal === undefined) {
    result.added.push({ path, value: newVal });
    return;
  }
  if (newVal === null || newVal === undefined) {
    result.removed.push({ path, value: oldVal });
    return;
  }

  // Different types
  if (typeof oldVal !== typeof newVal || Array.isArray(oldVal) !== Array.isArray(newVal)) {
    result.modified.push({ path, oldValue: oldVal, newValue: newVal });
    return;
  }

  // Both arrays
  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    const maxLen = Math.max(oldVal.length, newVal.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = `${path}[${i}]`;
      if (i >= oldVal.length) {
        result.added.push({ path: childPath, value: newVal[i] });
      } else if (i >= newVal.length) {
        result.removed.push({ path: childPath, value: oldVal[i] });
      } else {
        deepDiff(oldVal[i], newVal[i], childPath, result);
      }
    }
    return;
  }

  // Both objects
  if (typeof oldVal === 'object' && typeof newVal === 'object') {
    const oldRecord = oldVal as Record<string, unknown>;
    const newRecord = newVal as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]);

    for (const key of allKeys) {
      const childPath = `${path}.${key}`;
      if (!(key in oldRecord)) {
        result.added.push({ path: childPath, value: newRecord[key] });
      } else if (!(key in newRecord)) {
        result.removed.push({ path: childPath, value: oldRecord[key] });
      } else {
        deepDiff(oldRecord[key], newRecord[key], childPath, result);
      }
    }
    return;
  }

  // Primitives
  if (oldVal !== newVal) {
    result.modified.push({ path, oldValue: oldVal, newValue: newVal });
  } else {
    result.unchanged++;
  }
}

function isPrimitive(value: unknown): boolean {
  return value === null || value === undefined || typeof value !== 'object';
}
