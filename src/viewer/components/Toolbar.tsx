import type { SupportedFormat } from '@/shared/types';

type ViewMode = 'formatted' | 'tree' | 'raw' | 'diff' | 'types';

interface ToolbarProps {
  format: SupportedFormat;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function Toolbar({
  format,
  viewMode,
  onViewModeChange,
  onExpandAll,
  onCollapseAll,
}: ToolbarProps) {
  const modes: { key: ViewMode; label: string }[] = [
    { key: 'formatted', label: 'Formatted' },
    { key: 'tree', label: 'Tree' },
    { key: 'raw', label: 'Raw' },
    { key: 'diff', label: 'Diff' },
    { key: 'types', label: 'Types' },
  ];

  return (
    <div className="toolbar">
      <span className="format-badge">{format}</span>
      {modes.map((m) => (
        <button
          key={m.key}
          className={viewMode === m.key ? 'active' : ''}
          onClick={() => onViewModeChange(m.key)}
        >
          {m.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      {viewMode === 'tree' && (
        <>
          <button onClick={onExpandAll}>Expand All</button>
          <button onClick={onCollapseAll}>Collapse All</button>
        </>
      )}
    </div>
  );
}
