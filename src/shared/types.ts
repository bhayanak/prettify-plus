export type SupportedFormat = 'json' | 'yaml' | 'xml' | 'toml' | 'csv';

export interface DetectionResult {
  format: SupportedFormat | null;
  confidence: number;
  contentType?: string;
  rawText: string;
}

export interface TreeNodeData {
  key: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string;
  depth: number;
  childCount: number;
  isExpanded: boolean;
}

export interface DiffResult {
  added: { path: string; value: unknown }[];
  removed: { path: string; value: unknown }[];
  modified: { path: string; oldValue: unknown; newValue: unknown }[];
  unchanged: number;
}

export interface InferredType {
  typeName: string;
  typescript: string;
  fields: { name: string; type: string; optional: boolean }[];
}

export interface ViewerConfig {
  enabledFormats: SupportedFormat[];
  theme: 'github-dark' | 'github-light' | 'monokai' | 'dracula' | 'nord';
  defaultExpanded: boolean;
  maxExpandDepth: number;
  enableDiff: boolean;
  enableTypeGen: boolean;
  fontSize: number;
}

export interface CachedResponse {
  url: string;
  data: string;
  format: SupportedFormat;
  timestamp: string;
}
