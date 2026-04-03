# Ikary Manifest

Open-source declarative cell contracts, compilation engine, and React renderer for the [Ikary Platform](https://ikary.io).

## What is Ikary Manifest?

Ikary Manifest lets you define **entire business applications declaratively** using JSON/TypeScript manifests. A manifest describes entities (data models), pages (UI), navigation, roles, lifecycle transitions, and validation rules. The runtime then compiles and renders a fully functional React application from that manifest.

## Packages

| Package | Description |
|---|---|
| [`@ikary-manifest/contract`](./packages/contract/) | Zod schemas, TypeScript types, and validation for cell manifests |
| [`@ikary-manifest/presentation`](./packages/presentation/) | Presentation-layer schemas for 40+ UI primitives |
| [`@ikary-manifest/engine`](./packages/engine/) | Manifest compilation, field derivation, scope registry, route builders |
| [`@ikary-manifest/runtime-ui`](./packages/runtime-ui/) | Declarative UI engine: primitive registry, resolver, actions, EntityClient |
| [`@ikary-manifest/renderer`](./packages/renderer/) | Manifest-driven React renderer: CellAppRenderer, data grids, forms, sheets |
| [`@ikary-manifest/data-runtime`](./packages/data-runtime/) | Data-binding glue: wires entity data to the UI runtime context |

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
```

## Architecture

```
contract  (Zod schemas + types)
   |
   +--> presentation  (UI primitive schemas)
   |
   +--> engine  (compilation + derivation)
   |
   +--> runtime-ui  (primitives + registries + EntityClient)
   |         |
   |         +--> renderer  (CellAppRenderer + forms + grids)
   |         |
   |         +--> data-runtime  (data-binding providers)
```

All packages are framework-agnostic at the schema level. The `runtime-ui`, `renderer`, and `data-runtime` packages use React.

## Extensibility

- **Custom primitives**: Use `registerPrimitive()` to add your own UI components
- **Custom data backends**: Implement the `EntityClient` interface to connect to any API
- **Custom UI components**: Provide a `UIComponents` implementation to swap out form controls, data grids, etc.
- **Mock mode**: Render manifests with `fakeEntityClient` — no backend required

## Documentation

- [Entity Definition Standard](./docs/ENTITY-DEFINITION.md)
- [Entity Governance](./docs/ENTITY-GOVERNANCE.md)
- [Entity Contract](./docs/ENTITY-CONTRACT.md)
- [API Conventions](./docs/API-CONVENTIONS.md)

## License

[MIT](./LICENSE)
