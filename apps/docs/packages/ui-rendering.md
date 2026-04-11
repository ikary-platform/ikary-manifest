# UI Rendering

UI rendering transforms a compiled manifest into a React application. The manifest's page and entity definitions drive routing, data fetching, form generation, and component rendering.

## Packages

| Package | Role |
|---------|------|
| `@ikary/presentation` | Zod schemas for 40+ UI primitive contracts |
| `@ikary/primitives` | React components, resolvers, adapters, and registry |
| `@ikary/data` | Data providers and entity data hooks |
| `@ikary/renderer` | Top-level app shell and page router |

UI rendering currently targets React 19+. Vue.js is the next planned renderer.

## Install

```bash
pnpm add @ikary/renderer @ikary/primitives @ikary/data
```

`@ikary/presentation` is a peer dependency and installs with the packages above.

## Peer dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.0.0",
  "@tanstack/react-query": "^5.0.0"
}
```

## Primitive architecture

Each UI element is a primitive. Every primitive has four parts:

| Part | Role |
|------|------|
| **Contract** | Zod schema describing what to render. Stored in `@ikary/presentation`. |
| **Adapter** | Maps the contract and live runtime state to final component props. |
| **Component** | The React element that renders those props. |
| **Resolver** | The runtime entry point that calls the adapter and returns the component. |

A registry maps primitive keys to their resolvers. The runtime discovers components by key at render time.

This architecture separates the declarative description from the implementation. Replacing the React components does not change the contracts or the manifest format.

## @ikary/presentation

Defines presentation contracts as Zod schemas. A contract describes what a primitive should render.

```typescript
import { DataGridPresentationSchema } from '@ikary/presentation';

// Validate a presentation contract
const result = DataGridPresentationSchema.safeParse(contract);
```

## @ikary/primitives

Implements the primitives: React components, adapters, resolvers, and the registry.

```typescript
import { primitiveRegistry } from '@ikary/primitives/registry';

// The registry maps primitive keys to their resolvers
const resolver = primitiveRegistry.get('data-grid');
```

## @ikary/data

Provides data-binding hooks and providers that connect entity data to the primitive runtime.

```typescript
import { DataHooksProvider, EntityRegistryProvider } from '@ikary/data';
```

Wrap your application with these providers to give primitives access to entity data.

## @ikary/renderer

The top-level renderer. `CellAppRenderer` reads a compiled manifest and renders the full application: routing, navigation, pages, and forms.

```typescript
import { CellAppRenderer } from '@ikary/renderer';
import { compileCellApp } from '@ikary/engine';

const compiled = compileCellApp(manifest);

function App() {
  return <CellAppRenderer manifest={compiled} />;
}
```

## Related pages

- [Runtime UI](/guide/runtime-ui): concept-level explanation
- [Packages Overview](/packages/overview): full dependency graph
