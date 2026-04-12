---
outline: deep
---

# Capability Matrix

This matrix describes current project status by capability area.

Status levels:

- `stable`: production-ready interface with active maintenance
- `beta`: usable and tested, but API and behavior can still evolve
- `experimental`: available for exploration and feedback, not a long-term stability promise yet

## Core manifest pipeline

| Capability | Primary package or app | Status | Notes |
|---|---|---|---|
| Manifest schema and types | `@ikary/contract` | stable | Zod-first contracts with semantic validation |
| YAML and JSON loading | `@ikary/loader` | stable | Handles parsing and validation pipeline entry |
| Manifest compilation | `@ikary/engine` | stable | Produces normalized runtime manifest |

## UI runtime

| Capability | Primary package or app | Status | Notes |
|---|---|---|---|
| Primitive contracts | `@ikary/presentation` | stable | Contract definitions for UI primitives |
| Primitive rendering | `@ikary/primitives` | beta | Core runtime path for primitive rendering |
| App rendering shell | `@ikary/renderer` | beta | Renders compiled manifests as app views |
| Data provider integration | `@ikary/data` | beta | Entity client integration and hooks |

## API and tooling

| Capability | Primary package or app | Status | Notes |
|---|---|---|---|
| Contract Intelligence REST API | `@ikary/mcp-server` | beta | Public API for schema discovery and validation |
| MCP tool interface | `@ikary/mcp-server` | beta | Tooling endpoint for AI assistants |
| Runtime API service from manifests | `@ikary/cell-runtime-api` | beta | Local runtime service generated from manifests |
| CLI authoring workflow | `@ikary/cli` | stable | Project scaffolding, validate, compile, local stack |
| Primitive Studio | `@ikary/primitive-studio` | beta | Live custom primitive iteration |

## Guidance

For production adoption, prefer `stable` and `beta` capabilities and track release notes before upgrading.
