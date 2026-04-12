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
3. Run `pnpm test`, `pnpm typecheck`, and `pnpm docs:build` when docs are affected
4. Open a pull request

## Repository layout

```text
ikary-manifest/
  manifests/       # YAML source of truth (schemas and examples)
  libs/            # Core TypeScript libraries
  apps/            # Executables and services (CLI, runtime APIs, docs, playgrounds)
  decisions/       # Architecture decision records
```

## Documentation layout

```text
apps/docs/
  index.md
  guide/
  cli/
  api/
  reference/
  packages/
  sdks/
```

## Package conventions

- Use `pnpm` workspaces for dependency management
- Use `turbo` for build orchestration
- Use `tsup` for bundling when a package ships bundles
- Use `vitest` for tests
- Use Zod for runtime validation

## Code conventions

- Keep manifests as YAML for authored content
- Entity keys, field keys, and relation keys must be `snake_case`
- Derive TypeScript types from Zod schemas with `z.infer`
- Keep contract packages pure: no filesystem access and no framework runtime dependencies
- Add tests for new validation rules and loader behavior

## Docs commands

```bash
pnpm docs:dev
pnpm docs:build
```

## License

[MIT](https://github.com/ikary-platform/ikary-manifest/blob/main/LICENSE)
