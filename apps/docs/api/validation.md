---
outline: deep
---

<script setup>
import { data } from './api.data.ts'
const { baseUrl } = data
</script>

# Validation

Validate manifests, entities, and pages against the schema and semantic rules. The normalize endpoint validates and fills in defaults.

All validation endpoints return `{ valid, errors }`. When `valid` is `true`, the `errors` array is empty. When `valid` is `false`, each error includes the field path and a message.

## POST /api/validate/manifest

Full structural and semantic validation of a CellManifestV1 JSON object.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `manifest` | object | Yes | A CellManifestV1 object |

### Request

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

### Response (valid)

```json
{ "valid": true, "errors": [] }
```

### Response (invalid)

```bash-vue
curl -X POST {{ baseUrl }}/api/validate/manifest \
  -H "Content-Type: application/json" \
  -d '{ "manifest": { "apiVersion": "wrong", "kind": "Cell" } }'
```

```json
{
  "valid": false,
  "errors": [
    { "field": "apiVersion", "message": "Invalid literal value, expected \"ikary.co/v1alpha1\"" },
    { "field": "metadata", "message": "Required" },
    { "field": "spec", "message": "Required" }
  ]
}
```

Each error in the array maps to a specific field path. Use [explain-errors](/api/guidance#post-apiguidanceexplain-errors) to convert these into actionable fix suggestions.

---

## POST /api/validate/entity

Validates a single EntityDefinition in isolation. Runs both structural and semantic checks.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entity` | object | Yes | An EntityDefinition object |

### Request

```bash-vue
curl -X POST {{ baseUrl }}/api/validate/entity \
  -H "Content-Type: application/json" \
  -d '{
    "entity": {
      "key": "customer",
      "name": "Customer",
      "pluralName": "Customers",
      "fields": [{ "key": "name", "type": "string", "name": "Name" }]
    }
  }'
```

### Response

```json
{ "valid": true, "errors": [] }
```

---

## POST /api/validate/page

Validates a single PageDefinition against the schema.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | object | Yes | A PageDefinition object |

### Request

```bash-vue
curl -X POST {{ baseUrl }}/api/validate/page \
  -H "Content-Type: application/json" \
  -d '{
    "page": {
      "key": "dashboard",
      "type": "dashboard",
      "title": "Dashboard",
      "path": "/"
    }
  }'
```

### Response

```json
{ "valid": true, "errors": [] }
```

---

## POST /api/validate/normalize

Validates a manifest and, if valid, returns a normalized version. Normalization fills in defaults and resolves omitted arrays to empty arrays.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `manifest` | object | Yes | A CellManifestV1 object |

### Request

```bash-vue
curl -X POST {{ baseUrl }}/api/validate/normalize \
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

### Response

```json
{
  "valid": true,
  "manifest": {
    "apiVersion": "ikary.co/v1alpha1",
    "kind": "Cell",
    "metadata": { "key": "test", "name": "Test", "version": "0.1.0" },
    "spec": {
      "mount": { "mountPath": "/test", "landingPage": "dashboard" },
      "pages": [{ "key": "dashboard", "type": "dashboard", "title": "Dashboard", "path": "/" }],
      "entities": [],
      "navigation": { "items": [] }
    }
  },
  "errors": []
}
```

The normalized output includes `entities: []` and `navigation: { items: [] }` even though the input omitted them. This is the difference from `/api/validate/manifest`, which only checks validity without transforming the input.

If the manifest is invalid, the response matches the same `{ valid: false, errors }` shape as the other validation endpoints. No `manifest` field is returned on failure.
