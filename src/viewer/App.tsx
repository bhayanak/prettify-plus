import { useState, useEffect, useMemo } from 'react';
import type { SupportedFormat, TreeNodeData, ViewerConfig } from '@/shared/types';
import { DEFAULT_CONFIG } from '@/shared/constants';
import { parseJSON } from './parsers/json-parser';
import { parseYAML } from './parsers/yaml-parser';
import { parseXML } from './parsers/xml-parser';
import { parseTOML } from './parsers/toml-parser';
import { parseCSV } from './parsers/csv-parser';
import { TreeView } from './components/TreeView';
import { Toolbar } from './components/Toolbar';
import { RawView } from './components/RawView';
import { FormattedView } from './components/FormattedView';
import { SearchBar } from './components/SearchBar';
import { PathBreadcrumb } from './components/PathBreadcrumb';
import { DiffView } from './components/DiffView';
import { TypeGenerator } from './components/TypeGenerator';

type ViewMode = 'formatted' | 'tree' | 'raw' | 'diff' | 'types';

interface ViewerData {
  format: SupportedFormat;
  data: string;
  sourceUrl?: string;
}

const parsers: Record<SupportedFormat, (text: string) => { data: unknown; nodes: TreeNodeData[] }> =
  {
    json: parseJSON,
    yaml: parseYAML,
    xml: parseXML,
    toml: parseTOML,
    csv: parseCSV,
  };

const SETTINGS_KEY = 'prettify-plus-settings';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  const [selectedPath, setSelectedPath] = useState('$');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerData, setViewerData] = useState<ViewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ViewerConfig>(DEFAULT_CONFIG);

  // Load settings from chrome.storage.sync
  useEffect(() => {
    chrome.storage.sync.get(SETTINGS_KEY, (result) => {
      const stored = result[SETTINGS_KEY] as ViewerConfig | undefined;
      if (stored) setConfig((prev) => ({ ...prev, ...stored }));
    });
    // Listen for settings changes (e.g. from popup)
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'sync' && changes[SETTINGS_KEY]?.newValue) {
        const newVal = changes[SETTINGS_KEY].newValue as Partial<ViewerConfig>;
        setConfig((prev) => ({ ...prev, ...newVal }));
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const themes: Record<string, Record<string, string>> = {
      'github-dark': {
        '--bg-primary': '#0d1117',
        '--bg-secondary': '#161b22',
        '--text-primary': '#e6edf3',
        '--text-secondary': '#8b949e',
        '--accent': '#58a6ff',
        '--border': '#30363d',
        '--key-color': '#79c0ff',
        '--string-color': '#a5d6ff',
        '--number-color': '#d2a8ff',
        '--boolean-color': '#ff7b72',
        '--null-color': '#ffa657',
      },
      'github-light': {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f6f8fa',
        '--text-primary': '#1f2328',
        '--text-secondary': '#656d76',
        '--accent': '#0969da',
        '--border': '#d0d7de',
        '--key-color': '#0550ae',
        '--string-color': '#0a3069',
        '--number-color': '#8250df',
        '--boolean-color': '#cf222e',
        '--null-color': '#953800',
      },
      monokai: {
        '--bg-primary': '#272822',
        '--bg-secondary': '#3e3d32',
        '--text-primary': '#f8f8f2',
        '--text-secondary': '#75715e',
        '--accent': '#a6e22e',
        '--border': '#49483e',
        '--key-color': '#f92672',
        '--string-color': '#e6db74',
        '--number-color': '#ae81ff',
        '--boolean-color': '#ae81ff',
        '--null-color': '#fd971f',
      },
      dracula: {
        '--bg-primary': '#282a36',
        '--bg-secondary': '#44475a',
        '--text-primary': '#f8f8f2',
        '--text-secondary': '#6272a4',
        '--accent': '#bd93f9',
        '--border': '#44475a',
        '--key-color': '#8be9fd',
        '--string-color': '#f1fa8c',
        '--number-color': '#bd93f9',
        '--boolean-color': '#ff79c6',
        '--null-color': '#ffb86c',
      },
      nord: {
        '--bg-primary': '#2e3440',
        '--bg-secondary': '#3b4252',
        '--text-primary': '#eceff4',
        '--text-secondary': '#d8dee9',
        '--accent': '#88c0d0',
        '--border': '#4c566a',
        '--key-color': '#81a1c1',
        '--string-color': '#a3be8c',
        '--number-color': '#b48ead',
        '--boolean-color': '#d08770',
        '--null-color': '#bf616a',
      },
    };

    const vars = themes[config.theme] ?? themes['github-dark'];
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.style.setProperty('--font-size', `${config.fontSize}px`);
    document.body.style.fontSize = `${config.fontSize}px`;
  }, [config.theme, config.fontSize]);

  // Load data from chrome.storage.local on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const format = params.get('format') as SupportedFormat | null;
    const storageKey = params.get('key');
    const sourceUrl = params.get('source') || undefined;

    if (!format || !storageKey) {
      setError('Missing format or storage key in URL.');
      setLoading(false);
      return;
    }

    chrome.storage.local.get(storageKey, (result) => {
      const stored = result[storageKey] as { data?: string } | undefined;
      if (!stored || !stored.data) {
        setError('Data not found in storage. It may have expired.');
        setLoading(false);
        return;
      }
      setViewerData({ format, data: stored.data, sourceUrl });
      setLoading(false);
      // Clean up the storage key after reading
      chrome.storage.local.remove(storageKey);
    });
  }, []);

  const parsed = useMemo(() => {
    if (!viewerData) return null;
    try {
      const parser = parsers[viewerData.format];
      return parser(viewerData.data);
    } catch (e) {
      console.error('Parse error:', e);
      return null;
    }
  }, [viewerData]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (parsed) {
      const initial = new Set<string>();
      for (const node of parsed.nodes) {
        if (node.isExpanded) initial.add(node.path);
      }
      setExpandedPaths(initial);
    }
  }, [parsed]);

  const filteredNodes = useMemo(() => {
    if (!parsed || !searchQuery) return parsed?.nodes ?? [];
    const lower = searchQuery.toLowerCase();
    return parsed.nodes.filter(
      (n) =>
        n.key.toLowerCase().includes(lower) ||
        String(n.value).toLowerCase().includes(lower) ||
        n.path.toLowerCase().includes(lower),
    );
  }, [parsed, searchQuery]);

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h2>Prettify Plus</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !viewerData || !parsed) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h2>Prettify Plus</h2>
        <p>
          {error || 'No data to display. Open a URL that returns JSON, YAML, XML, TOML, or CSV.'}
        </p>
      </div>
    );
  }

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const expandAll = () => {
    if (parsed) {
      setExpandedPaths(new Set(parsed.nodes.filter((n) => n.childCount > 0).map((n) => n.path)));
    }
  };

  const collapseAll = () => setExpandedPaths(new Set());

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  return (
    <div>
      {viewerData.sourceUrl && (
        <div className="source-bar">
          <span>Source:</span>
          <a href={viewerData.sourceUrl} title="Go back to original page">
            {viewerData.sourceUrl}
          </a>
        </div>
      )}
      <Toolbar
        format={viewerData.format}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />
      {viewMode === 'formatted' && (
        <FormattedView text={viewerData.data} data={parsed.data} format={viewerData.format} />
      )}
      {viewMode === 'tree' && (
        <>
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            resultCount={searchQuery ? filteredNodes.length : undefined}
          />
          <PathBreadcrumb path={selectedPath} />
          <TreeView
            nodes={filteredNodes}
            expandedPaths={expandedPaths}
            onToggle={toggleExpand}
            onSelect={(path) => {
              setSelectedPath(path);
              copyPath(path);
            }}
          />
        </>
      )}
      {viewMode === 'raw' && <RawView text={viewerData.data} format={viewerData.format} />}
      {viewMode === 'diff' && <DiffView currentData={parsed.data} url={window.location.href} />}
      {viewMode === 'types' && <TypeGenerator data={parsed.data} />}
    </div>
  );
}
