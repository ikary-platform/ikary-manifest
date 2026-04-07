# Mount

Configures where a Cell attaches to the platform URL space and which page loads first.

## Responsibilities

- Sets the Cell's base URL via `mountPath`.
- Declares the `landingPage` that the router opens by default.
- Provides an optional `title` for display in navigation chrome.

## Non-Goals

- Does not define routing rules for individual pages. Page schemas handle that.
- Does not resolve conflicts when two Cells claim the same path.

## Schema Surface

Defined in [`mount.schema.yaml`](./mount.schema.yaml).

## Validation Notes

| Field         | Type     | Required | Constraint              |
|---------------|----------|----------|-------------------------|
| `mountPath`   | `string` | Yes      | Pattern `^/`            |
| `landingPage` | `string` | Yes      | References a page key   |
| `title`       | `string` | No       | Free-form text          |

The `mountPath` must start with a forward slash.

## Example

```yaml
mountPath: /crm
landingPage: dashboard
title: CRM
```
