interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount?: number;
}

export function SearchBar({ query, onQueryChange, resultCount }: SearchBarProps) {
  return (
    <div className="search-bar" style={{ padding: '8px 16px', background: 'var(--bg-secondary)' }}>
      <input
        type="text"
        placeholder="Search keys, values, or paths..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {resultCount !== undefined && (
        <span className="result-count">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
