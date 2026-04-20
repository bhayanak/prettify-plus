<p align="center"><img src="logo.svg" width="128" /></p>
<h1 align="center">Prettify Plus</h1>
<p align="center">
  <img src="https://img.shields.io/badge/CI-passing-brightgreen?style=flat-square" alt="CI" />
  <img src="https://img.shields.io/badge/coverage-%3E95%25-brightgreen?style=flat-square" alt="Coverage" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/manifest-v3-blueviolet?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Chrome-supported-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome" />
  <img src="https://img.shields.io/badge/Firefox-supported-FF7139?style=flat-square&logo=firefox&logoColor=white" alt="Firefox" />
</p>
<p align="center">
  Beautify JSON, YAML, XML, TOML &amp; CSV in your browser.<br/>
  <strong>Formatted view · Tree view · JSONPath search · Type generation · Response diff</strong>
</p>

## Features

- **Auto-detect** JSON, YAML, XML, TOML, CSV in browser tabs
- **Collapsible tree view** with syntax highlighting
- **JSONPath/XPath search** console
- **Click-to-copy** path (`$.users[0].name`)
- **TypeScript type generation** from data
- **Response diff** — compare current vs. previous visit
- **Raw/formatted toggle**
- Chrome + Firefox + Edge (Manifest V3)

## Supported Formats

| Format | Detection | Tree View | Path Query | Diff | Type Gen |
|--------|-----------|-----------|------------|------|----------|
| JSON   | ✅        | ✅        | JSONPath   | ✅   | ✅       |
| YAML   | ✅        | ✅        | JSONPath   | ✅   | ✅       |
| XML    | ✅        | ✅        | XPath      | ✅   | ❌       |
| TOML   | ✅        | ✅        | JSONPath   | ✅   | ✅       |
| CSV    | ✅        | Table     | ❌         | ✅   | ✅       |

## Install

```bash
pnpm install
```

## Loading in Chrome

1. Run `pnpm build` to build the extension
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the `dist/` folder
5. The extension icon should appear in your toolbar

### Enable Local File Access

To use Prettify Plus with local files (`file://` URLs):

1. Go to `chrome://extensions/`
2. Click **Details** on the Prettify Plus card
3. Enable **Allow access to file URLs**
4. Now open any local `.json`, `.yaml`, `.xml`, `.toml`, or `.csv` file in Chrome

### Extension Permissions

- **"When you click the extension"** — content script only runs when you click the extension icon (most restrictive)
- **"On specific sites"** — runs automatically on sites you choose
- **"On all sites"** — runs automatically on every page (detects data formats instantly)

> **Recommended**: Set to **"On all sites"** for the best experience. The extension only activates when it detects valid JSON/YAML/XML/TOML/CSV content.

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Test

```bash
pnpm test              # Run tests
pnpm test:coverage     # Run with coverage
```

## Full CI Pipeline

```bash
pnpm ci   # typecheck → lint → format:check → audit → test:coverage → build
```

## Package

```bash
pnpm package:chrome    # Chrome Web Store (.zip)
pnpm package:firefox   # Firefox Add-ons (.xpi)
pnpm package:edge      # Edge Add-ons (.zip)
```

## License

MIT
