---
outline: deep
---

# Node SDK

The Node SDK is the current reference implementation of the canonical manifest model. It is the most complete consumer of the YAML contract, but it is still a consumer rather than the conceptual source of truth.

## Standard layers

| Layer | Package | Responsibility |
| --- | --- | --- |
| `loader` | `@ikary/cell-loader` | Parse YAML or JSON and return validated manifest data |
| `contract` | `@ikary/cell-contract` | Node-facing schema, types, and validation bindings |
| `engine` | `@ikary/cell-engine` | Compile canonical expressions into runtime-ready application structures |

Additional runtime packages such as `presentation`, `primitives`, `renderer`, and `data` consume the compiled manifest to render application behavior.

## What the Node SDK exposes today

### 1. Schema

- Zod schemas for the Node runtime
- generated bundled JSON Schema for tooling that needs a single JSON artifact

### 2. Language-native types

- TypeScript types inferred from the contract layer
- shared manifest types for application and entity expressions

### 3. Validation

- structural validation through the contract layer
- semantic validation for business rules that go beyond raw structure

These three outputs are what let the Node SDK serve both runtime code and LLM-oriented workflows.

## Important clarification

The Node `contract` package is the Node SDK binding layer. It is not the ultimate conceptual authority for the project.

Use this authority ladder:

1. canonical YAML schemas and examples under `manifests/`
2. Node contract bindings in `@ikary/cell-contract`
3. Node engine compilation in `@ikary/cell-engine`
4. Node runtime packages that render or execute the compiled result

## Package docs

- [Package overview](/packages/overview)
- [`@ikary/cell-loader`](/packages/loading)
- [`@ikary/cell-contract`](/packages/overview)
- [`@ikary/cell-engine`](/packages/engine)
