---
outline: deep
---

# SDKs

Node and Python are consumers of the same canonical YAML contract. They should share the same vocabulary even when they are not at the same maturity level yet.

## Shared language

Across both SDKs, the docs use the same layer names:

| Layer | Responsibility |
| --- | --- |
| `loader` | Read YAML or JSON, parse it, and handle file-level concerns |
| `contract` | Expose schema, language-native types, and validation |
| `engine` | Compile validated expressions into runtime/application behavior |

## Shared outputs

Every SDK should expose or generate the same three outputs from the manifest contract:

| Output | Purpose |
| --- | --- |
| Schema | Give LLMs and external tools a precise description of expected JSON |
| Types | Let application code reference the canonical model directly |
| Validation | Verify generated output and support self-correction loops |

## Current status by SDK

| SDK | Loader | Contract | Engine |
| --- | --- | --- | --- |
| Node | Available | Available | Available |
| Python | Available | Planned | Planned |

The Node SDK is currently the most complete reference implementation. The Python SDK already consumes the same YAML authoring model and is expected to grow toward the same contract and engine layers.

## HTTP and MCP access

The same schema discovery, validation, and guidance capabilities are available over HTTP and MCP without installing an SDK. See the [Contract Intelligence API](/api/) for REST endpoints and the [MCP Endpoint](/api/mcp) for AI agent tool use.

## Where to go next

- [Node SDK](/sdks/node) for the current reference implementation
- [Python SDK](/sdks/python) for the current Python consumer and roadmap
- [Manifest Model](/manifest/) for the YAML-first authority model that both SDKs follow
