# Metadata

Identifies a Cell manifest with a unique key, human-readable name, and version string.
Every manifest document must include this block.

## Responsibilities

- Assigns a globally unique `key` to the Cell.
- Gives the Cell a display `name` for UIs and logs.
- Pins the manifest to a specific `version`.
- Carries an optional `description` for documentation and tooling.

## Non-Goals

- Does not validate version ordering or compatibility between releases.
- Does not enforce uniqueness of `key` across a deployment. The platform registry handles that.

## Schema Surface

Defined in [`metadata.schema.yaml`](./metadata.schema.yaml).

## Validation Notes

| Field         | Type     | Required | Constraint                              |
|---------------|----------|----------|-----------------------------------------|
| `key`         | `string` | Yes      | Pattern `^[a-z][a-z0-9-]*$`            |
| `name`        | `string` | Yes      | `minLength: 1`                          |
| `version`     | `string` | Yes      | Semver-like pattern                     |
| `description` | `string` | No       | Free-form text                          |

The `key` field accepts only lowercase letters, digits, and hyphens.
It must start with a letter.

## Example

```yaml
key: crm
name: CRM Cell
version: "1.0.0"
description: Customer relationship management
```
