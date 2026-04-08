---
outline: deep
---

<script setup>
import { data } from './api.data.ts'
const { baseUrl } = data
</script>

# Contract Intelligence API

HTTP API for discovering manifest schemas, browsing UI primitives, validating manifests, and getting structural guidance.

## Base URL

<pre><code>{{ baseUrl }}</code></pre>

All endpoints are prefixed with `/api/` except the MCP endpoint at `/mcp`.

## Authentication

None. The API is public and requires no authentication.

## Quick start

Fetch the manifest schema:

```bash-vue
curl {{ baseUrl }}/api/schemas/manifest
```

Validate a manifest:

```bash-vue
curl -X POST {{ baseUrl }}/api/validate/manifest \
  -H "Content-Type: application/json" \
  -d '{
    "manifest": {
      "apiVersion": "ikary.co/v1alpha1",
      "kind": "Cell",
      "metadata": { "key": "test", "name": "Test", "version": "0.1.0" },
      "spec": {
        "mount": { "mountPath": "/test", "landingPage": "dashboard" },
        "pages": [{ "key": "dashboard", "type": "dashboard", "title": "Dashboard", "path": "/" }]
      }
    }
  }'
```

Response:

```json
{ "valid": true, "errors": [] }
```

## Endpoints

### Schema Discovery

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/schemas/manifest` | CellManifestV1 schema |
| `GET` | `/api/schemas/entity` | EntityDefinition schema |
| `GET` | `/api/schemas/page` | PageDefinition schema |
| `GET` | `/api/schemas/capability` | CapabilityDefinition schema |

See [Schema Discovery](./schemas) for parameters and response examples.

### UI Primitives

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/primitives` | List all 30 UI primitives |
| `GET` | `/api/primitives/{key}` | Get one primitive contract |

See [UI Primitives](./primitives) for the full catalog.

### Example Manifests

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/examples` | List available example manifests |
| `GET` | `/api/examples/{key}` | Get one example manifest |

See [Example Manifests](./examples) for available keys.

### Guidance

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/guidance/recommend` | Recommend manifest structure from a business goal |
| `POST` | `/api/guidance/suggest-pages` | Generate pages for a set of entities |
| `POST` | `/api/guidance/suggest-relations` | Suggest entity relations |
| `POST` | `/api/guidance/explain-errors` | Turn validation errors into fix suggestions |

See [Guidance](./guidance) for request bodies and examples.

### Validation

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/validate/manifest` | Validate a full CellManifestV1 |
| `POST` | `/api/validate/entity` | Validate a single EntityDefinition |
| `POST` | `/api/validate/page` | Validate a single PageDefinition |
| `POST` | `/api/validate/normalize` | Validate and normalize a manifest |

See [Validation](./validation) for request and response shapes.

### MCP

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/mcp` | MCP Streamable HTTP transport (JSON-RPC 2.0) |

The same capabilities are available as MCP tools for AI agents. See [MCP Endpoint](./mcp) for connection setup.

## Response format

All responses are JSON. GET endpoints return the resource directly. POST validation endpoints return `{ valid, errors }` or `{ valid, manifest, errors }`. POST guidance endpoints return structured recommendations.

Error responses follow a consistent shape. See [Error Handling](./errors) for the full reference.

## Interactive documentation

Swagger UI is available at [`/api/docs`](https://public.ikary.co/api/docs) for interactive exploration.
