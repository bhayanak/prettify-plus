import { useMemo } from 'react';
import { inferType } from '../utils/type-inferrer';

interface TypeGeneratorProps {
  data: unknown;
}

export function TypeGenerator({ data }: TypeGeneratorProps) {
  const inferred = useMemo(() => inferType(data, 'Root'), [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inferred.typescript);
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14 }}>TypeScript Types</h3>
        <button
          onClick={handleCopy}
          style={{
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: 'none',
            padding: '4px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Copy
        </button>
      </div>
      <div className="type-output">{inferred.typescript}</div>
    </div>
  );
}
