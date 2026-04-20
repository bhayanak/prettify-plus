# Contributing to Prettify Plus

## Getting Started

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Start development: `pnpm dev`
4. Run tests: `pnpm test`

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run the full CI pipeline: `pnpm ci`
4. Submit a pull request

## Code Standards

- TypeScript strict mode
- ESLint with security plugin
- Prettier formatting
- 95%+ test coverage required

## Testing

```bash
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage enforcement
```

## Architecture

- `src/content/` — Content script for format detection
- `src/background/` — Service worker for caching & schema inference
- `src/viewer/` — React app for the formatted view
- `src/popup/` — Extension popup for settings
- `src/shared/` — Shared types and constants
