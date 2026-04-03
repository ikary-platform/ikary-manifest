# Manifests

This directory is the **language-neutral source of truth** for Ikary cell definitions. Everything here is YAML.

## Structure

```
manifests/
  entities/       # Standalone entity YAML files (composable)
  examples/       # Complete Cell manifest examples
  schemas/        # YAML schemas (JSON Schema syntax in YAML)
```

## Conventions

### Schema references

Every manifest and entity file declares which schema it conforms to:

```yaml
$schema: "../schemas/cell-manifest.schema.yaml"
```

### Entity composition via `$ref`

Manifests reference standalone entity files using the standard `$ref` keyword:

```yaml
spec:
  entities:
    - $ref: "../entities/customer.entity.yaml"
    - $ref: "../entities/invoice.entity.yaml"
```

This is the same `$ref` convention used by JSON Schema and OpenAPI. The loader strips unresolved `$ref` entries before validation; full file-based resolution is a planned feature.

### Schema cross-references

Schema files reference each other using `$ref` with relative paths:

```yaml
# In entity-definition.schema.yaml
fields:
  type: array
  items:
    $ref: "./field-definition.schema.yaml"
```

## Why YAML everywhere?

- Readable and writable by humans without tooling
- Language-neutral — TypeScript and Python consume the same files
- Decouples definitions from any runtime implementation
- Diffable and reviewable by non-engineers (product, domain, compliance)
- No JSON noise (quotes, commas, brackets)

## How it works

1. Authors write YAML manifests and entity files in this directory
2. The TypeScript runtime (`@ikary-manifest/loader`) parses YAML, strips meta-properties, validates via Zod
3. The engine (`@ikary-manifest/engine`) compiles validated manifests into runtime-ready structures
4. Python consumers use the YAML schemas for structural validation

## Shared artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| YAML manifests | `entities/`, `examples/` | Authoring source of truth |
| YAML schemas | `schemas/` | Language-neutral structural validation |
| Bundled JSON Schema | `node/dist/schemas/` (generated) | Tooling that requires single-file JSON |
