import { useState, useEffect } from 'react';
import { diffObjects } from '../utils/differ';
import type { DiffResult } from '@/shared/types';

interface DiffViewProps {
  currentData: unknown;
  url: string;
}

export function DiffView({ currentData, url: _url }: DiffViewProps) {
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real extension, we'd fetch previous data from background cache.
    // For now, show a placeholder.
    try {
      // Demo: diff against empty object
      const result = diffObjects({}, currentData);
      setDiff(result);
    } catch (e) {
      setError(String(e));
    }
  }, [currentData]);

  if (error) {
    return <div style={{ padding: 16, color: 'var(--null-color)' }}>Diff error: {error}</div>;
  }

  if (!diff) {
    return <div style={{ padding: 16 }}>Computing diff...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Response Diff</h3>
      <div style={{ marginBottom: 8 }}>
        <strong>Added:</strong> {diff.added.length} | <strong>Removed:</strong>{' '}
        {diff.removed.length} | <strong>Modified:</strong> {diff.modified.length} |{' '}
        <strong>Unchanged:</strong> {diff.unchanged}
      </div>
      {diff.added.map((item) => (
        <div key={item.path} className="diff-added" style={{ padding: '2px 8px' }}>
          + {item.path}: {JSON.stringify(item.value)}
        </div>
      ))}
      {diff.removed.map((item) => (
        <div key={item.path} className="diff-removed" style={{ padding: '2px 8px' }}>
          - {item.path}: {JSON.stringify(item.value)}
        </div>
      ))}
      {diff.modified.map((item) => (
        <div key={item.path} className="diff-modified" style={{ padding: '2px 8px' }}>
          ~ {item.path}: {JSON.stringify(item.oldValue)} → {JSON.stringify(item.newValue)}
        </div>
      ))}
    </div>
  );
}
