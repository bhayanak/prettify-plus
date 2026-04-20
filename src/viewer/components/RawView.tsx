import type { SupportedFormat } from '@/shared/types';

interface RawViewProps {
  text: string;
  format: SupportedFormat;
}

export function RawView({ text, format }: RawViewProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className="format-badge">{format}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '4px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Copy Raw
        </button>
      </div>
      <pre className="raw-view">{text}</pre>
    </div>
  );
}
