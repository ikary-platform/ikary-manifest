---
outline: deep
---

# SDKs

## Shared layers

All SDK implementations use the same layer names:

| Layer | Responsibility |
| --- | --- |
| `loader` | Read YAML or JSON, parse it, and handle file-level concerns |
| `contract` | Expose schema, language-native types, and validation |
| `engine` | Compile validated expressions into runtime/application behavior |

## Shared outputs

Every SDK exposes or generates three outputs from the manifest contract:

| Output | Purpose |
| --- | --- |
| Schema | Give LLMs and external tools a precise description of expected JSON |
| Types | Let application code reference the canonical model directly |
| Validation | Verify generated output and support self-correction loops |

## Current status

| SDK | Loader | Contract | Engine |
| --- | --- | --- | --- |
| Node | Available | Available | Available |

## HTTP and MCP access

The same schema discovery, validation, and guidance capabilities are available over HTTP and MCP without installing an SDK. See the [Contract Intelligence API](/api/) for REST endpoints and the [MCP Endpoint](/api/mcp) for AI agent tool use.

## Where to go next

- [Node SDK](/sdks/node) for the current reference implementation
