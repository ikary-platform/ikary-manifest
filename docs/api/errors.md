---
outline: deep
---

# Error Handling

All API endpoints use consistent error shapes. This page describes the formats and common patterns.

## Validation response

Validation endpoints (`/api/validate/*`) return a result object, not an HTTP error:

```json
{
  "valid": false,
  "errors": [
    { "field": "metadata", "message": "Required" },
    { "field": "apiVersion", "message": "Invalid literal value, expected \"ikary.co/v1alpha1\"" }
  ]
}
```

The HTTP status is `201` for all validation responses, including failures. Check the `valid` field to determine the result.

Each error includes:

| Field | Type | Description |
|-------|------|-------------|
| `field` | string | The path to the invalid field |
| `message` | string | What went wrong |

## Resource not found

When a request references a key that does not exist (a primitive key, an example key, or a filtered type), the API returns a JSON error:

```json
{ "error": "Primitive \"unknown-key\" not found in the catalog" }
```

```json
{ "error": "Example file not found at unknown-key.yaml" }
```

The HTTP status for these is `404` or returned inline depending on the endpoint.

## Malformed request body

If the request body is missing or not valid JSON, the API returns an error from the framework:

```json
{
  "statusCode": 400,
  "message": "Unexpected token ...",
  "error": "Bad Request"
}
```

## Common error patterns

| Scenario | Error shape |
|----------|------------|
| Missing required field in manifest | `{ "field": "metadata", "message": "Required" }` |
| Wrong literal value | `{ "field": "apiVersion", "message": "Invalid literal value, expected \"ikary.co/v1alpha1\"" }` |
| Unknown primitive key | `{ "error": "Primitive \"foo\" not found in the catalog" }` |
| Unknown example key | `{ "error": "Example file not found at foo.yaml" }` |
| Invalid page type filter | `{ "error": "Unknown page type: foo" }` |
| Empty or missing request body | Framework-level 400 error |
