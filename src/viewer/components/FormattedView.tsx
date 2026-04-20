import { useState, useMemo, useCallback } from 'react';
import type { SupportedFormat } from '@/shared/types';

interface FormattedViewProps {
  text: string;
  data: unknown;
  format: SupportedFormat;
}

interface FoldRegion {
  startLine: number;
  endLine: number;
}

export function FormattedView({ text, data, format }: FormattedViewProps) {
  const prettyText = useMemo(() => formatPretty(text, data, format), [text, data, format]);
  const lines = useMemo(() => prettyText.split('\n'), [prettyText]);

  // Find foldable regions (lines with { or [ that have a matching close)
  const foldRegions = useMemo(() => findFoldRegions(lines), [lines]);

  const [collapsedRegions, setCollapsedRegions] = useState<Set<number>>(new Set());

  const toggleFold = useCallback((startLine: number) => {
    setCollapsedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(startLine)) next.delete(startLine);
      else next.add(startLine);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedRegions(new Set(foldRegions.map((r) => r.startLine)));
  }, [foldRegions]);

  const expandAll = useCallback(() => {
    setCollapsedRegions(new Set());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(prettyText);
  };

  // Build visible lines, skipping collapsed interiors
  const visibleLines: {
    lineNum: number;
    content: string;
    foldable: boolean;
    collapsed: boolean;
  }[] = [];
  const hiddenRanges = new Set<number>();

  for (const region of foldRegions) {
    if (collapsedRegions.has(region.startLine)) {
      for (let i = region.startLine + 1; i <= region.endLine; i++) {
        hiddenRanges.add(i);
      }
    }
  }

  const foldStarts = new Map(foldRegions.map((r) => [r.startLine, r]));

  for (let i = 0; i < lines.length; i++) {
    if (hiddenRanges.has(i)) continue;
    const isFoldable = foldStarts.has(i);
    const isCollapsed = collapsedRegions.has(i);
    visibleLines.push({
      lineNum: i,
      content: lines[i],
      foldable: isFoldable,
      collapsed: isCollapsed,
    });
  }

  return (
    <div>
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span className="format-badge">{format}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="fmt-btn" onClick={expandAll}>
            Expand All
          </button>
          <button className="fmt-btn" onClick={collapseAll}>
            Collapse All
          </button>
          <button className="fmt-btn" onClick={handleCopy}>
            Copy
          </button>
        </div>
      </div>
      <div className="formatted-view">
        <table className="formatted-table">
          <tbody>
            {visibleLines.map((line) => (
              <tr key={line.lineNum} className="formatted-line">
                <td className="line-num">{line.lineNum + 1}</td>
                <td className="line-fold">
                  {line.foldable ? (
                    <span
                      className="fold-toggle"
                      onClick={() => toggleFold(line.lineNum)}
                      title={line.collapsed ? 'Expand' : 'Collapse'}
                    >
                      {line.collapsed ? '▸' : '▾'}
                    </span>
                  ) : null}
                </td>
                <td className="line-content">
                  <SyntaxLine text={line.content} format={format} />
                  {line.collapsed && (
                    <span className="collapsed-indicator" onClick={() => toggleFold(line.lineNum)}>
                      {' '}
                      ...{' '}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatPretty(text: string, data: unknown, format: SupportedFormat): string {
  switch (format) {
    case 'json':
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return text;
      }
    default:
      // For YAML/XML/TOML/CSV, return the raw text (already readable)
      return text;
  }
}

function findFoldRegions(lines: string[]): FoldRegion[] {
  const regions: FoldRegion[] = [];
  const stack: { char: string; line: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimEnd();
    for (const ch of trimmed) {
      if (ch === '{' || ch === '[') {
        stack.push({ char: ch, line: i });
      } else if (ch === '}' || ch === ']') {
        const open = stack.pop();
        if (open && open.line < i) {
          regions.push({ startLine: open.line, endLine: i });
        }
      }
    }
  }

  // Sort by start line
  regions.sort((a, b) => a.startLine - b.startLine);
  return regions;
}

function SyntaxLine({ text, format }: { text: string; format: SupportedFormat }) {
  if (format === 'json') return <JsonLine text={text} />;
  if (format === 'xml') return <XmlLine text={text} />;
  // For YAML/TOML/CSV, use generic highlighting
  return <GenericLine text={text} />;
}

function JsonLine({ text }: { text: string }) {
  // Highlight JSON syntax: keys, strings, numbers, booleans, null, brackets
  const parts: { text: string; className: string }[] = [];
  let remaining = text;

  // Leading whitespace
  const leadingMatch = remaining.match(/^(\s+)/);
  if (leadingMatch) {
    parts.push({ text: leadingMatch[1], className: '' });
    remaining = remaining.slice(leadingMatch[1].length);
  }

  // Tokenize the rest
  while (remaining.length > 0) {
    // Key (quoted string followed by colon)
    const keyMatch = remaining.match(/^("(?:[^"\\]|\\.)*")\s*:/);
    if (keyMatch) {
      parts.push({ text: keyMatch[1], className: 'syn-key' });
      parts.push({ text: ': ', className: 'syn-punct' });
      remaining = remaining.slice(keyMatch[0].length).trimStart();
      // Restore the space that trimStart removed but after colon
      continue;
    }

    // String value
    const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
    if (strMatch) {
      parts.push({ text: strMatch[1], className: 'syn-string' });
      remaining = remaining.slice(strMatch[1].length);
      continue;
    }

    // Number
    const numMatch = remaining.match(/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
    if (numMatch) {
      parts.push({ text: numMatch[1], className: 'syn-number' });
      remaining = remaining.slice(numMatch[1].length);
      continue;
    }

    // Boolean / null
    const boolMatch = remaining.match(/^(true|false|null)/);
    if (boolMatch) {
      parts.push({
        text: boolMatch[1],
        className: boolMatch[1] === 'null' ? 'syn-null' : 'syn-boolean',
      });
      remaining = remaining.slice(boolMatch[1].length);
      continue;
    }

    // Brackets, commas, colons
    const punctMatch = remaining.match(/^([{}[\],:])/);
    if (punctMatch) {
      parts.push({ text: punctMatch[1], className: 'syn-bracket' });
      remaining = remaining.slice(1);
      continue;
    }

    // Anything else (whitespace, etc)
    parts.push({ text: remaining[0], className: '' });
    remaining = remaining.slice(1);
  }

  return (
    <span>
      {parts.map((p, i) => (
        <span key={i} className={p.className}>
          {p.text}
        </span>
      ))}
    </span>
  );
}

function XmlLine({ text }: { text: string }) {
  // Simple XML highlighting
  const parts: { text: string; className: string }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Tag
    const tagMatch = remaining.match(/^(<\/?[a-zA-Z][^>]*\/?>)/);
    if (tagMatch) {
      parts.push({ text: tagMatch[1], className: 'syn-key' });
      remaining = remaining.slice(tagMatch[1].length);
      continue;
    }

    // Attribute value
    const attrMatch = remaining.match(/^("[^"]*"|'[^']*')/);
    if (attrMatch) {
      parts.push({ text: attrMatch[1], className: 'syn-string' });
      remaining = remaining.slice(attrMatch[1].length);
      continue;
    }

    parts.push({ text: remaining[0], className: '' });
    remaining = remaining.slice(1);
  }

  return (
    <span>
      {parts.map((p, i) => (
        <span key={i} className={p.className}>
          {p.text}
        </span>
      ))}
    </span>
  );
}

function GenericLine({ text }: { text: string }) {
  return <span>{text}</span>;
}
