---
outline: deep
---

<script setup>
import { data } from './api.data.ts'
const { baseUrl } = data
</script>

# Example Manifests

Browse and retrieve sample manifests from the examples catalog. These are complete, valid manifests you can use as starting points or reference material.

## GET /api/examples

Returns all available example manifests with metadata.

### Request

```bash-vue
curl {{ baseUrl }}/api/examples
```

### Response

```json
[
  {
    "key": "minimal-manifest",
    "title": "Minimal Cell",
    "description": "Simplest possible manifest with a single dashboard page.",
    "entities": [],
    "format": "yaml"
  },
  {
    "key": "crm-manifest",
    "title": "CRM Application",
    "description": "Full CRM with customers, invoices, roles, pages, and navigation.",
    "entities": ["customer", "invoice"],
    "format": "yaml"
  },
  {
    "key": "entities/customer.entity",
    "title": "Customer Entity",
    "description": "Customer entity with fields, relations, lifecycle, and capabilities.",
    "entities": ["customer"],
    "format": "yaml"
  },
  {
    "key": "entities/invoice.entity",
    "title": "Invoice Entity",
    "description": "Invoice entity with fields and belongs_to relation to customer.",
    "entities": ["invoice"],
    "format": "yaml"
  }
]
```

Each entry includes the `key` for retrieval, a human-readable `title` and `description`, the list of entities it defines, and the source format.

---

## GET /api/examples/{key}

Returns the full content of one example manifest.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `key` | path | string | Yes | Example key from the catalog (e.g., `crm-manifest`) |

### Request

```bash-vue
curl {{ baseUrl }}/api/examples/crm-manifest
```

### Response

Returns the full manifest content as a JSON object. The exact shape matches the CellManifestV1 schema for complete manifests, or EntityDefinition for standalone entity examples.

Returns an error if the key does not match any known example. See [Error Handling](/api/errors) for the error shape.

### Available keys

| Key | Description |
|-----|-------------|
| `minimal-manifest` | Minimal cell with a single dashboard page |
| `crm-manifest` | Full CRM with customers, invoices, roles, pages, and navigation |
| `entities/customer.entity` | Standalone customer entity definition |
| `entities/invoice.entity` | Standalone invoice entity definition |
