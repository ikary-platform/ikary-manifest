# Ikary Manifest

**AI should generate manifests, not code.**

Open-source declarative cell contracts, compilation engine, and multi-runtime renderer for the [Ikary Platform](https://ikary.co).

## Why Ikary Manifest?

AI-native code generation tools produce code. This creates a fundamental problem: **generated code is unpredictable, hard to maintain, and expensive to validate in production.** Every generated line is a liability -- it must be reviewed, tested, versioned, and debugged like hand-written code, except nobody wrote it.

Ikary Manifest takes a different approach. Instead of generating code, **LLMs generate a canonical YAML manifest** that a deterministic runtime compiles into a fully functional application. The manifest is the product. The code is an implementation detail.

### The case for manifests over generated code

1. **Deterministic output** -- The same manifest always produces the same application. No hallucinated logic, no subtle runtime bugs, no "works on my machine." The runtime is tested once; every manifest benefits.

2. **Drastically lower maintenance** -- Updating a business rule means changing a YAML field, not hunting through generated controllers, services, and components. No dead code, no orphaned files, no framework-specific boilerplate to maintain.

3. **Code quality is not a concern** -- LLMs don't produce code, so there is no code to review for quality. The manifest is a structured declaration: either it validates or it doesn't. There is no "bad style" in YAML.

4. **Any model can do it** -- Generating a correct YAML document is orders of magnitude simpler than generating correct, idiomatic, production-grade code across multiple frameworks. Smaller, cheaper models produce valid manifests reliably. Token cost for application generation drops dramatically.

5. **Runtime evolves independently** -- The manifest is canonical. The underlying engine can change stack, upgrade frameworks, optimize rendering, or switch languages -- without touching the generation layer. Clear separation of concerns between AI generation and runtime execution.

6. **Reviewable by non-engineers** -- A YAML manifest is readable by product owners, domain experts, and compliance teams. They can review, diff, and approve application changes without reading code.

7. **Validated before runtime** -- Manifests are structurally and semantically validated before any code runs. Invalid manifests are caught at authoring time, not in production. Generated code fails at runtime.

8. **Multi-runtime portability** -- One manifest, multiple runtimes. React today, mobile tomorrow, FastAPI backend next week. Code generation locks you to one framework; a manifest is framework-neutral by design.

## What is Ikary Manifest?

Ikary Manifest lets you define **entire business applications declaratively** using YAML manifests. A manifest describes entities (data models), pages (UI), navigation, roles, lifecycle transitions, and validation rules. The runtime then compiles and renders a fully functional application from that manifest.

## Repository Structure

```
ikary-manifest/
  manifests/               # Language-neutral source of truth
    entities/              # Standalone entity YAML fragments
    examples/              # Complete Cell manifest examples (YAML)
    schemas/               # Generated JSON Schema files
  node/                    # TypeScript/Node.js packages
    packages/
      contract/            # Zod schemas, TS types, validation
      loader/              # YAML/JSON loading and parsing
      engine/              # Compilation, normalization, field derivation
      presentation/        # UI primitive presentation schemas
      runtime-ui/          # Declarative UI engine, primitives, registries
      renderer/            # Manifest-driven React renderer
      data-runtime/        # Data-binding providers
      generator-nest/      # NestJS code generator (placeholder)
      cli/                 # Developer CLI (placeholder)
  python/                  # Python SDK
    ikary_manifest/
      loader/              # YAML/JSON loading
      runtime/             # Runtime (placeholder)
      generator_fastapi/   # FastAPI generator (placeholder)
  docs/                    # Documentation
```

## Node Packages

| Package | Description |
|---|---|
| [`@ikary-manifest/contract`](./node/packages/contract/) | Zod schemas, TypeScript types, and validation for cell manifests |
| [`@ikary-manifest/loader`](./node/packages/loader/) | YAML/JSON manifest loading, parsing, and validation pipeline |
| [`@ikary-manifest/engine`](./node/packages/engine/) | Manifest compilation, field derivation, scope registry, route builders |
| [`@ikary-manifest/presentation`](./node/packages/presentation/) | Presentation-layer schemas for 40+ UI primitives |
| [`@ikary-manifest/runtime-ui`](./node/packages/runtime-ui/) | Declarative UI engine: primitive registry, resolver, actions, EntityClient |
| [`@ikary-manifest/renderer`](./node/packages/renderer/) | Manifest-driven React renderer: CellAppRenderer, data grids, forms, sheets |
| [`@ikary-manifest/data-runtime`](./node/packages/data-runtime/) | Data-binding glue: wires entity data to the UI runtime context |

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
```

## How Manifests Work

YAML is the authoring format. The processing pipeline:

```
YAML manifest (manifests/)
    |
    v
@ikary-manifest/loader     # Parse YAML -> JSON object
    |
    v
@ikary-manifest/contract   # Zod structural validation + semantic rules
    |
    v
@ikary-manifest/engine     # Normalization + compilation -> runtime manifest
```

Python consumers use the same YAML manifests with generated JSON Schema for structural validation.

## Architecture

```
contract  (Zod schemas + types)
   |
   +--> loader  (YAML/JSON parsing + validation pipeline)
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

Full documentation: **[ikary-platform.github.io/ikary-manifest](https://ikary-platform.github.io/ikary-manifest/)**

- [Why Ikary Manifest](./docs/guide/why-ikary-manifest.md)
- [Getting Started](./docs/guide/getting-started.md)
- [Architecture](./docs/guide/architecture.md)
- [Manifest Format](./docs/guide/manifest-format.md)
- [Entity Definition](./docs/reference/entity-definition.md)
- [Entity Governance](./docs/reference/entity-governance.md)

```bash
pnpm docs:dev   # Run docs locally at localhost:5173
```

## License

[MIT](./LICENSE)
