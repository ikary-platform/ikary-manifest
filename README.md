# Ikary Manifest

**AI should generate manifests, not code.**

Open-source declarative cell contracts, compilation engine, and multi-runtime renderer for the [Ikary Platform](https://ikary.co).

## Why Ikary Manifest?

AI-native code generation tools produce code. This creates a practical problem: **generated code is unpredictable, hard to maintain, and expensive to validate in production.** Every generated line must be reviewed, tested, versioned, and debugged like hand-written code, without the benefit of human intent behind it.

Ikary Manifest takes a different approach. Instead of generating code, **LLMs generate a canonical YAML manifest** that a deterministic runtime compiles into a fully functional application. The manifest describes what to build; the runtime handles how to build it.

### The case for manifests over generated code

1. **Deterministic output**: The same manifest always produces the same application. The runtime is tested once; every manifest benefits from that work.

2. **Lower maintenance overhead**: Updating a business rule means changing a YAML field, not hunting through generated controllers, services, and components. No dead code, no orphaned files, no framework boilerplate to maintain.

3. **No code to review for quality**: LLMs generate a structured declaration, not source code. A manifest either validates or it does not. There is no style to debate in YAML.

4. **Works with any model**: Generating a correct YAML document is significantly simpler than generating correct, idiomatic, production-grade code across multiple frameworks. Smaller, cheaper models produce valid manifests reliably.

5. **Runtime evolves independently**: The manifest is canonical. The underlying engine can change stack, upgrade frameworks, optimize rendering, or switch languages without touching the generation layer. There is a clear separation of concerns between AI generation and runtime execution.

6. **Reviewable by non-engineers**: A YAML manifest is readable by product owners, domain experts, and compliance teams. They can review, diff, and approve application changes without reading code.

7. **Validated before runtime**: Manifests are structurally and semantically validated before any code runs. Invalid manifests are caught at authoring time, not in production.

8. **Multi-runtime portability**: One manifest, multiple runtimes. React today, mobile tomorrow, FastAPI backend next week. Code generation ties you to one framework; a manifest is framework-neutral by design.

## What is Ikary Manifest?

Ikary Manifest lets you define **entire business applications declaratively** using YAML manifests. A manifest describes entities (data models), pages (UI), navigation, roles, lifecycle transitions, and validation rules. The runtime then compiles and renders a fully functional application from that manifest.

## Repository Structure

```text
ikary-manifest/
  manifests/                 # Canonical YAML schemas + examples
  libs/                      # Core libraries (contract, loader, engine, renderer, etc.)
  apps/                      # Executables and services (CLI, preview server, MCP server)
  runtime-api/               # Runtime API generators/adapters
  docs/                      # VitePress docs site
  decisions/                 # Architecture decision records and diagrams
```

## Core Packages

| Package               | Path                                        | Responsibility                                                  |
| --------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `@ikary/contract`     | [`libs/contract`](./libs/contract/)         | Zod schemas, TypeScript types, structural + semantic validation |
| `@ikary/loader`       | [`libs/loader`](./libs/loader/)             | YAML/JSON loading, parsing, and pre-validation pipeline         |
| `@ikary/engine`       | [`libs/engine`](./libs/engine/)             | Manifest normalization, compilation, and derivation             |
| `@ikary/presentation` | [`libs/presentation`](./libs/presentation/) | Presentation contracts for UI primitives                        |
| `@ikary/primitives`   | [`libs/primitives`](./libs/primitives/)     | Runtime primitive components, resolvers, and registry           |
| `@ikary/renderer`     | [`libs/renderer`](./libs/renderer/)         | React rendering runtime (pages, forms, grids, detail views)     |
| `@ikary/data`         | [`libs/data`](./libs/data/)                 | Data providers and page/runtime data orchestration              |
| `@ikary/cli`          | [`apps/cli`](./apps/cli/)                   | Authoring and local-stack developer workflow                    |

## Quick Start

### Option A: Use the published CLI (fastest)

```bash
npx ikary init
```

Then run:

```bash
ikary validate manifests/examples/crm-manifest.yaml
ikary compile manifests/examples/crm-manifest.yaml
ikary local start manifests/examples/crm-manifest.yaml
```

### Option B: Work from this monorepo

```bash
pnpm install
pnpm build
pnpm test
```

## Local Stack Ports

When you run `ikary local start <manifest-path>`, three services start on the following ports:

| Port | Service        |
| ---- | -------------- |
| 4500 | Preview Server |
| 4501 | Data API       |
| 4502 | MCP Server     |

## How Manifests Work

YAML is the authoring format. The processing pipeline:

```mermaid
flowchart TD
    M["YAML manifest<br/>(manifests/)"] --> L["@ikary/loader<br/>Parse YAML → JSON object"]
    L --> C["@ikary/contract<br/>Zod structural validation + semantic rules"]
    C --> E["@ikary/engine<br/>Normalization + compilation → runtime manifest"]
```

## Architecture

```mermaid
flowchart TD
    C["contract<br/>Zod schemas + types"]
    L["loader<br/>YAML/JSON parsing + validation pipeline"]
    P["presentation<br/>UI primitive schemas"]
    E["engine<br/>compilation + derivation"]
    R["runtime-ui<br/>primitives + registries + EntityClient"]
    RR["renderer<br/>CellAppRenderer + forms + grids"]
    D["data-runtime<br/>data-binding providers"]

    C --> L
    C --> P
    C --> E
    C --> R
    R --> RR
    R --> D
```

All packages are framework-agnostic at the schema level. The `runtime-ui`, `renderer`, and `data-runtime` packages use React.

## Extensibility

- **Custom primitives**: Use `registerPrimitive()` to add your own UI components
- **Custom data backends**: Implement the `EntityClient` interface to connect to any API
- **Custom UI components**: Provide a `UIComponents` implementation to swap out form controls, data grids, etc.
- **Mock mode**: Render manifests with `fakeEntityClient`, no backend required

## Documentation

Full documentation: **[ikary-platform.github.io/ikary-manifest](https://ikary-platform.github.io/ikary-manifest/)**

- [Why Ikary Manifest](./docs/guide/why-ikary-manifest.md)
- [CLI Guide](./docs/guide/cli.md)
- [Architecture](./docs/guide/architecture.md)
- [Manifest Format](./docs/guide/manifest-format.md)
- [Runtime UI](./docs/guide/runtime-ui.md)
- [Runtime API](./docs/guide/runtime-api.md)
- [Entity Definition](./docs/reference/entity-definition.md)
- [Entity Governance](./docs/reference/entity-governance.md)

```bash
pnpm docs:dev   # Run docs locally at localhost:5173
```

## License

[MIT](./LICENSE)
