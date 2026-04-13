# Runtime UI

The UI runtime reads pages and entities from a compiled manifest and renders a complete web application. Authors define what the application contains; the runtime handles how it renders.

## What it renders

Each page type in the manifest maps to a rendered view:

| Page type | What renders |
|-----------|-------------|
| `entity-list` | A data grid bound to the entity, with filtering and pagination |
| `entity-detail` | A read-only detail view for a single record |
| `dashboard` | A layout with configurable widgets |

The runtime handles routing, data fetching, form generation, and navigation state. The manifest drives the structure; the runtime drives the execution.

## Current stack and roadmap

**Renderer: React 19+.** React is the first target. Vue.js is the next planned renderer. The primitive architecture (described below) is not React-specific. Adding a new renderer means implementing a new registry of components against the same primitive contracts.

**CSS: Tailwind CSS.** Tailwind provides sensible visual defaults. The renderer does not depend on Tailwind; it is the default configuration, not a hard requirement. Authors can extend or replace it.

**Dependencies: intentionally low.** The project is open-source and avoids coupling to heavy third-party UI frameworks. Each package pulls only what it needs.

## Primitive architecture

Each UI element in the runtime is a primitive. Every primitive has four parts:

- **Contract**: a Zod schema that describes what the primitive expects to render. Stored in `@ikary/cell-presentation`.
- **Adapter**: maps the contract and live runtime state to final component props.
- **Component**: the React element that renders those props.
- **Resolver**: the runtime entry point that calls the adapter and returns the rendered component.

A registry maps primitive keys to their resolvers. The runtime discovers and invokes primitives by key at render time.

This architecture separates the declarative description (what to render) from the implementation (how to render it). Replacing the React components does not change the contracts or the manifest format.

## Packages

| Package | Role |
|---------|------|
| `@ikary/cell-presentation` | Zod schemas for 40+ UI primitive contracts |
| `@ikary/cell-primitives` | React components, resolvers, adapters, and primitive registry |
| `@ikary/cell-renderer` | Top-level `CellAppRenderer` component |
| `@ikary/cell-data` | Data providers that implement the `EntityClient` interface |

## Related pages

- [UI Rendering](/packages/ui-rendering): full package API reference
- [Packages Overview](/packages/overview): dependency graph and directory structure
- [Manifest Format](/guide/manifest-format): pages, entities, and navigation structure
- [Architecture](/guide/architecture): how the contract, engine, and runtime layers relate
