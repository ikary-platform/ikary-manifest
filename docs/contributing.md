# Contributing

## Getting started

```bash
git clone https://github.com/ikary-platform/ikary-manifest.git
cd ikary-manifest
pnpm install
pnpm build
pnpm test
```

## Development workflow

1. Create a branch from `main`
2. Make changes
3. Run `pnpm test` and `pnpm typecheck`
4. Open a pull request

## Project structure

```
ikary-manifest/
  manifests/       # YAML source of truth (schemas, entities, examples)
  contracts/       # Schema, types, parsing, validation (Node.js + Python)
  runtime-api/     # Server-side REST API generation (NestJS + FastAPI)
  ui/              # Client-side React rendering
  apps/            # Standalone executables (CLI)
  docs/            # Documentation (VitePress)
```

## Packages

All TypeScript packages use:

- **pnpm** workspaces for dependency management
- **Turbo** for build orchestration
- **tsup** for bundling (ESM + CJS)
- **Vitest** for testing
- **Zod** for runtime validation

## Guidelines

- Keep manifests as YAML; do not use JSON for authored content
- Entity keys, field keys, and relation keys must be `snake_case`
- All TypeScript types are derived from Zod schemas (`z.infer`)
- Contract package stays pure: no I/O, no framework dependencies
- Tests are required for new validation rules and loader features

## Documentation

```bash
pnpm docs:dev     # Start local dev server
pnpm docs:build   # Build static site
```

Docs are markdown files in `docs/`. Edit them directly; VitePress handles the rest.

## License

[MIT](https://github.com/ikary-platform/ikary-manifest/blob/main/LICENSE)
