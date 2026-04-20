import type { ViewerConfig } from './types';

export const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export const MAX_CACHE_ENTRIES = 50;

export const DEFAULT_CONFIG: ViewerConfig = {
  enabledFormats: ['json', 'yaml', 'xml', 'toml', 'csv'],
  theme: 'github-dark',
  defaultExpanded: true,
  maxExpandDepth: 3,
  enableDiff: true,
  enableTypeGen: true,
  fontSize: 14,
};

export const THEMES = ['github-dark', 'github-light', 'monokai', 'dracula', 'nord'] as const;
