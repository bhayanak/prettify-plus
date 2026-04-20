# Prettify Plus — Universal Format Viewer | Implementation Plan

## 1. Overview

Build an **open-source browser extension** that auto-detects and beautifully formats **JSON, YAML, XML, TOML, CSV** responses in browser tabs. Adds syntax highlighting, collapsible tree view, JSONPath/XPath search, copy-path-on-click, schema inference, and response diffing.

### Why Build This

- Existing JSON viewer extensions are **outdated or abandoned** (JSON Viewer, JSON Formatter)
- **No extension handles YAML, XML, TOML, CSV** — only JSON
- No extension offers **JSONPath querying** or **schema inference**
- No extension diffs **current vs. previous response**
- API developers view formatted data **dozens of times per day**

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Auto-Detect** | Automatically identify JSON/YAML/XML/TOML/CSV in response body |
| **Syntax Highlighting** | Language-aware highlighting with theme support |
| **Collapsible Tree** | Expandable/collapsible nodes for nested structures |
| **JSONPath/XPath Search** | Query expressions to find specific data |
| **Copy Path** | Click any node → copy path to clipboard (`$.users[0].name`) |
| **Schema Inference** | "This looks like an array of users with fields: id, name, email" |
| **Response Diff** | Compare current response vs. previous (cached per URL) |
| **Type Generation** | Generate TypeScript interface from JSON/YAML structure |
| **Raw Toggle** | Switch between formatted and raw view |

---

## 2. Architecture

```
┌───────────────────────────────────────────────────┐
│              Prettify Plus Extension                │
├─────────────┬─────────────────┬───────────────────┤
│  Content    │  Viewer Page    │  Background        │
│  Script     │  (React)        │  Service Worker    │
│             │                 │                    │
│  - Detect   │  - Tree view    │  - Response cache  │
│    format   │  - Search/query │  - Diff engine     │
│  - Replace  │  - Copy path    │  - Schema inferrer │
│    page     │  - Diff view    │  - Settings        │
│    body     │  - Type gen     │                    │
└─────────────┴─────────────────┴───────────────────┘
```

### Technology Stack

| Component | Choice |
|-----------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite + CRXJS (Manifest V3) |
| Parsing | JSON native, js-yaml, fast-xml-parser, @iarna/toml, papaparse |
| Highlighting | Shiki (lightweight, theme-aware) |
| Tree View | Custom React component (for performance) |
| Test | Vitest + Testing Library |
| Lint | ESLint + eslint-plugin-security |
| Format | Prettier |
| CI | GitHub Actions |

---

## 3. Project Structure

```
prettify-plus/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── README.md
├── CHANGELOG.md
├── LICENSE (MIT)
├── logo.svg / logo.png
│
├── .github/workflows/
│   ├── ci.yml
│   └── release.yml
│
├── scripts/
│   └── generate-icons.ts         # Generate all icon sizes from source SVG
│
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       ├── icon-128.png
│       └── icon-512.png           # Store listing
│
├── src/
│   ├── background/
│   │   ├── index.ts
│   │   ├── response-cache.ts       # Cache responses per URL for diffing
│   │   ├── schema-inferrer.ts      # Infer TypeScript types from data
│   │   └── settings.ts
│   │
│   ├── content/
│   │   ├── index.ts                # Detects format, replaces page body
│   │   └── format-detector.ts      # Auto-detect JSON/YAML/XML/TOML/CSV
│   │
│   ├── viewer/
│   │   ├── App.tsx                 # Main viewer UI
│   │   ├── components/
│   │   │   ├── TreeView.tsx        # Collapsible tree with virtualization
│   │   │   ├── TreeNode.tsx        # Individual tree node
│   │   │   ├── SearchBar.tsx       # JSONPath/XPath query input
│   │   │   ├── PathBreadcrumb.tsx  # Shows current node path
│   │   │   ├── DiffView.tsx        # Side-by-side diff
│   │   │   ├── TypeGenerator.tsx   # TypeScript type output
│   │   │   ├── RawView.tsx         # Formatted raw text
│   │   │   ├── Toolbar.tsx         # Format toggle, copy, expand/collapse
│   │   │   └── ThemePicker.tsx     # Syntax theme selection
│   │   ├── parsers/
│   │   │   ├── json-parser.ts
│   │   │   ├── yaml-parser.ts
│   │   │   ├── xml-parser.ts
│   │   │   ├── toml-parser.ts
│   │   │   └── csv-parser.ts
│   │   └── utils/
│   │       ├── path-builder.ts     # Build JSONPath/XPath from tree position
│   │       ├── differ.ts           # Deep diff between two parsed structures
│   │       └── type-inferrer.ts    # JSON → TypeScript interface generator
│   │
│   ├── popup/
│   │   ├── App.tsx                 # Quick settings: theme, enabled formats
│   │   └── popup.css
│   │
│   └── shared/
│       ├── types.ts
│       └── constants.ts
│
├── test/
│   ├── unit/
│   │   ├── format-detector.test.ts
│   │   ├── json-parser.test.ts
│   │   ├── yaml-parser.test.ts
│   │   ├── xml-parser.test.ts
│   │   ├── path-builder.test.ts
│   │   ├── differ.test.ts
│   │   └── type-inferrer.test.ts
│   └── fixtures/
│       ├── sample.json
│       ├── sample.yaml
│       ├── sample.xml
│       ├── sample.toml
│       └── sample.csv
│
└── docs/
    └── CONTRIBUTING.md
```

---

## 4. Core Data Types

```typescript
type SupportedFormat = 'json' | 'yaml' | 'xml' | 'toml' | 'csv'

interface DetectionResult {
  format: SupportedFormat | null
  confidence: number              // 0-1
  contentType?: string
  rawText: string
}

interface TreeNode {
  key: string
  value: unknown
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  path: string                    // JSONPath: $.users[0].name
  depth: number
  childCount: number
  isExpanded: boolean
}

interface DiffResult {
  added: { path: string; value: unknown }[]
  removed: { path: string; value: unknown }[]
  modified: { path: string; oldValue: unknown; newValue: unknown }[]
  unchanged: number
}

interface InferredType {
  typeName: string
  typescript: string              // Full TypeScript interface/type
  fields: { name: string; type: string; optional: boolean }[]
}

interface ViewerConfig {
  enabledFormats: SupportedFormat[]
  theme: 'github-dark' | 'github-light' | 'monokai' | 'dracula' | 'nord'
  defaultExpanded: boolean
  maxExpandDepth: number
  enableDiff: boolean
  enableTypeGen: boolean
  fontSize: number
}

interface CachedResponse {
  url: string
  data: string
  format: SupportedFormat
  timestamp: string
}
```

---

## 5. Format Detection Logic

```typescript
function detectFormat(text: string, contentType?: string): DetectionResult {
  // 1. Check Content-Type header first
  if (contentType?.includes('application/json')) return { format: 'json', confidence: 1.0 }
  if (contentType?.includes('application/yaml') || contentType?.includes('text/yaml'))
    return { format: 'yaml', confidence: 1.0 }
  if (contentType?.includes('application/xml') || contentType?.includes('text/xml'))
    return { format: 'xml', confidence: 1.0 }

  // 2. Try parsing in order of likelihood
  const trimmed = text.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) tryJSON(trimmed)
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) tryXML(trimmed)
  if (trimmed.includes(': ') && !trimmed.startsWith('{')) tryYAML(trimmed)
  if (trimmed.includes('[') && trimmed.includes(']') && trimmed.includes('=')) tryTOML(trimmed)
  if (trimmed.includes(',') && trimmed.includes('\n')) tryCSV(trimmed)

  // 3. Return null if no format detected
  return { format: null, confidence: 0 }
}
```

---

## 6. Icon & Logo Design

### Design Concept
A **stylized code bracket `{ }` morphing into a prism** — representing structured data being "prettified" through a lens. Vibrant gradient from teal to purple, conveying transformation and clarity.

### Icon Variants
| Size | Usage |
|------|-------|
| 16×16 | Browser toolbar (small) |
| 32×32 | Browser toolbar (retina) |
| 48×48 | Extension management page |
| 128×128 | Chrome Web Store, Firefox Add-ons, Edge Add-ons |
| 512×512 | Store listings, promotional |

### Generation Script
```typescript
// scripts/generate-icons.ts
// Uses sharp to resize source SVG → PNG at all required sizes
// Run: pnpm generate:icons
import sharp from 'sharp';
const sizes = [16, 32, 48, 128, 512];
for (const size of sizes) {
  await sharp('logo.svg').resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}
```

### Design Guidelines
- **Primary colors**: Teal (#06B6D4) → Purple (#8B5CF6) gradient
- **Style**: Flat/minimal with subtle depth shadow
- **Background**: Transparent (PNG) for all browser contexts
- **Recognizable at 16px**: Simplified bracket silhouette at small sizes

---

## 7. Security Considerations

| Concern | Mitigation |
|---------|------------|
| **XSS via data** | All values rendered as `textContent`, never `innerHTML` |
| **Large payloads** | Max 10MB limit for formatting, virtualized tree for performance |
| **Content script scope** | Only activates on pages with detected data formats |
| **Clipboard API** | Copy uses `navigator.clipboard.writeText()` with user gesture |
| **No external requests** | Purely local processing, no data sent anywhere |
| **Memory management** | Response cache limited to 50 entries with LRU eviction |
| **Dependency audit** | `pnpm audit` runs in CI and build to catch known vulnerabilities |

---

## 8. CI/CD Pipeline

```yaml
# ci.yml
name: CI
on: { push: { branches: [main] }, pull_request: { branches: [main] } }
permissions: { contents: read, security-events: write }

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy: { matrix: { node-version: [18, 20, 22] } }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ matrix.node-version }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - name: CI — typecheck + lint + format + audit + test + build
        run: pnpm ci
        # pnpm ci runs: typecheck → lint → format:check → audit → test:coverage (95%+) → build

  security:
    runs-on: ubuntu-latest
    needs: ci
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=high
      - uses: aquasecurity/trivy-action@master
        with: { scan-type: 'fs', format: 'sarif', output: 'trivy.sarif', severity: 'CRITICAL,HIGH' }
      - uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: 'trivy.sarif' }
      - uses: anchore/sbom-action@v0
        with: { format: spdx-json, output-file: sbom.spdx.json }

  package:
    runs-on: ubuntu-latest
    needs: [ci, security]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile && pnpm build
      - run: pnpm package:chrome && pnpm package:firefox && pnpm package:edge
      - uses: actions/upload-artifact@v4
        with: { name: prettify-plus-chrome, path: 'dist-chrome/*.zip' }
      - uses: actions/upload-artifact@v4
        with: { name: prettify-plus-firefox, path: 'dist-firefox/*.xpi' }
      - uses: actions/upload-artifact@v4
        with: { name: prettify-plus-edge, path: 'dist-edge/*.zip' }
```

### Release Pipeline
```yaml
# release.yml
name: Release
on: { push: { tags: ['v*'] } }
permissions: { contents: write }

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm ci
      - run: pnpm package:chrome && pnpm package:firefox && pnpm package:edge
      - uses: anchore/sbom-action@v0
        with: { format: spdx-json, output-file: sbom.spdx.json }
      - uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
          files: |
            dist-chrome/*.zip
            dist-firefox/*.xpi
            dist-edge/*.zip
            sbom.spdx.json
      # Optional: auto-publish to stores
      # - uses: nicolo-ribaudo/chome-web-store-upload@v0.4
      # - uses: AkiVonAqumo/firefox-addon-action@v1
```

---

## 9. Changelog, README, Scripts

### Changelog
```markdown
# Changelog
## [1.0.0] - 2026-XX-XX
### Added
- Auto-detect JSON, YAML, XML, TOML, CSV in browser tabs
- Collapsible tree view with syntax highlighting (6 themes)
- JSONPath/XPath search console
- Click-to-copy path ($.users[0].name)
- Schema inference with TypeScript type generation
- Response diff (current vs. previous visit)
- Raw/formatted toggle
- Chrome + Firefox + Edge (Manifest V3)
```

### README Structure
```markdown
<p align="center"><img src="logo.png" width="128" /></p>
<h1 align="center">Prettify Plus</h1>
<p align="center">
  Beautify JSON, YAML, XML, TOML & CSV in your browser.<br/>
  <strong>Tree view · JSONPath search · Type generation · Response diff</strong>
</p>
[badges] [demo.gif]

## Supported Formats
| Format | Detection | Tree View | Path Query | Diff | Type Gen |
| JSON   | ✅        | ✅        | JSONPath   | ✅   | ✅       |
| YAML   | ✅        | ✅        | JSONPath   | ✅   | ✅       |
| XML    | ✅        | ✅        | XPath      | ✅   | ❌       |
| TOML   | ✅        | ✅        | JSONPath   | ✅   | ✅       |
| CSV    | ✅        | Table     | ❌         | ✅   | ✅       |

## Comparison
| Feature | Prettify Plus | JSON Viewer | JSON Formatter |
```

### npm Scripts
| Script | Description |
|--------|-------------|
| `pnpm dev` | Dev with hot reload |
| `pnpm build` | Production build |
| `pnpm ci` | **Full CI pipeline**: typecheck → lint → format:check → audit → test:coverage → build |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint with security plugin |
| `pnpm format:check` | Prettier check |
| `pnpm audit` | `pnpm audit --audit-level=high` — vulnerability check |
| `pnpm test:coverage` | Coverage enforcement (95%+ lines/fn/stmt, 90% branches) |
| `pnpm package:chrome` | Package for Chrome Web Store (.zip) |
| `pnpm package:firefox` | Package for Firefox Add-ons (.xpi) |
| `pnpm package:edge` | Package for Edge Add-ons (.zip) |
| `pnpm generate:icons` | Generate all icon sizes from logo.svg |

---

## 10. Implementation Phases

### Phase 1: JSON Viewer (Days 1-2)
- [ ] Format detection engine
- [ ] JSON parser + tree view with collapsible nodes
- [ ] Syntax highlighting with Shiki
- [ ] Copy path on click

### Phase 2: Multi-Format (Days 3-4)
- [ ] YAML parser + tree view
- [ ] XML parser + tree view
- [ ] TOML parser + tree view
- [ ] CSV → table view

### Phase 3: Advanced Features (Day 5)
- [ ] JSONPath/XPath search console
- [ ] TypeScript type generator
- [ ] Response caching + diff view
- [ ] Schema inference display

### Phase 4: Release (Days 6-7)
- [ ] Theme system (6 themes)
- [ ] Popup settings
- [ ] Icon & logo design + generation script
- [ ] CI/CD (`pnpm ci`), Trivy, SBOM, `pnpm audit`
- [ ] README with demo GIF
- [ ] Store submissions: Chrome Web Store + Firefox Add-ons + Edge Add-ons

---

## 11. Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 90 },
      exclude: ['test/**', 'scripts/**', '*.config.*'],
    },
  },
});
```
