---
outline: deep
---

<script setup>
import { data } from './api.data.ts'
const { baseUrl } = data
</script>

# MCP Endpoint

The IKARY Manifest API is available as an MCP server. AI agents and MCP-compatible clients can discover schemas, validate manifests, and get structural guidance through tool calls over the MCP protocol.

## Endpoint

<pre><code>POST {{ baseUrl }}/mcp</code></pre>

The transport is Streamable HTTP (JSON-RPC 2.0). The endpoint is stateless. No session management or initialization handshake is required.

## Connecting

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json-vue
{
  "mcpServers": {
    "ikary-manifest": {
      "url": "{{ baseUrl }}/mcp"
    }
  }
}
```

### Cursor

Add this to your `.cursor/mcp.json`:

```json-vue
{
  "mcpServers": {
    "ikary-manifest": {
      "url": "{{ baseUrl }}/mcp"
    }
  }
}
```

### Claude Code

```bash-vue
claude mcp add ikary-manifest {{ baseUrl }}/mcp
```

### Raw JSON-RPC

```bash-vue
curl -X POST {{ baseUrl }}/mcp \
  -H "Content-Type: application/json" \
  -d '{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }'
```

## Available tools

The server exposes 16 tools across four groups.

### Discovery

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_manifest_schema` | Returns the CellManifestV1 structure with fields, types, and semantic rules | `version` (string, optional) |
| `get_entity_definition_schema` | Returns the EntityDefinition contract | `version` (string, optional) |
| `get_page_schema` | Returns page types and their contracts | `pageType` (string, optional) |
| `get_capability_schema` | Returns the CapabilityDefinition contract | `capabilityType` (string, optional) |

### Registry

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_primitives` | Returns the catalog of 30 UI primitives | `category` (string, optional) |
| `get_primitive_contract` | Returns one primitive's presentation contract | `primitive` (string, required) |
| `list_examples` | Returns available sample manifests | (none) |
| `get_example_manifest` | Returns the full content of one example | `example` (string, required) |

### Guidance

| Tool | Description | Parameters |
|------|-------------|------------|
| `recommend_manifest_structure` | Recommends entities, pages, relations from a business goal | `goal` (string, required) |
| `suggest_page_set_for_entities` | Generates CRUD pages for given entities | `entities` (string[], required) |
| `suggest_relations` | Suggests relations from entity definitions | `entities` (object[], required) |
| `explain_validation_errors` | Turns validation errors into fix suggestions | `errors` (object[], required) |

### Validation

| Tool | Description | Parameters |
|------|-------------|------------|
| `validate_manifest` | Validates a full CellManifestV1 | `manifest` (object, required) |
| `validate_entity` | Validates a single EntityDefinition | `entity` (object, required) |
| `validate_page` | Validates a single PageDefinition | `page` (object, required) |
| `normalize_manifest` | Validates and normalizes a manifest | `manifest` (object, required) |

## Available resources

The server exposes 5 documentation resources that MCP clients can read for context.

| URI | Name | Description |
|-----|------|-------------|
| `ikary://docs/manifest-format` | ikary-manifest-format | Manifest format reference with root structure, spec fields, and semantic rules |
| `ikary://docs/entity-schema` | ikary-entity-schema | Entity definition schema with fields and semantic rules |
| `ikary://docs/page-types` | ikary-page-types | Page types with available types, fields, and semantic rules |
| `ikary://docs/field-types` | ikary-field-types | Field types covering string, text, number, boolean, date, datetime, enum, and object |
| `ikary://docs/primitive-catalog` | ikary-primitive-catalog | UI primitive catalog organized by category |

## Workflow example

A typical AI agent workflow:

1. Call `recommend_manifest_structure` with a business goal to get a starting structure
2. Build a manifest from the recommendations
3. Call `validate_manifest` to check for errors
4. If errors exist, call `explain_validation_errors` to understand what to fix
5. Correct the manifest and validate again
6. Call `normalize_manifest` to fill in defaults and get the final output

At any point, the agent can call `get_manifest_schema` or `get_entity_definition_schema` to look up field definitions, `list_primitives` to discover UI components, or read a resource for documentation context.
