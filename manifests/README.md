# Manifests

This directory is the **language-neutral source of truth** for Ikary cell definitions. Everything here is YAML.

## Structure

```
manifests/
  cell-manifest.schema.yaml   # Entry point: top-level manifest
  metadata.schema.yaml        # Entry point: manifest identity
  cell-spec.schema.yaml       # Entry point: spec body

  shared/                     # Sub-schemas used by root schemas
  app-shell/                  # Shell layout, branding, regions
  entities/                   # Entity domain schemas
  navigation/                 # Navigation menu schemas
  pages/                      # Page definition schemas
  roles/                      # Role and permission schemas

  examples/                   # Complete manifest examples
    entities/                 # Standalone entity YAML files (composable)
```

## Conventions

### Schema references

Every manifest and entity file declares which schema it conforms to:

```yaml
# A manifest file (relative to manifests/examples/)
$schema: "../cell-manifest.schema.yaml"

# A standalone entity file (relative to manifests/examples/entities/)
$schema: "../../entities/entity-definition.schema.yaml"
```

### Entity composition via `$ref`

Manifests reference standalone entity files using the standard `$ref` keyword:

```yaml
spec:
  entities:
    - $ref: "./entities/customer.entity.yaml"
    - $ref: "./entities/invoice.entity.yaml"
```

This is the same `$ref` convention used by JSON Schema and OpenAPI. The loader strips unresolved `$ref` entries before validation; full file-based resolution is a planned feature.

### Schema cross-references

Schema files reference each other using `$ref` with relative paths:

```yaml
# In entities/entity-definition.schema.yaml
fields:
  type: array
  items:
    $ref: "./field-definition.schema.yaml"
```

## Why YAML everywhere?

- Readable and writable by humans without tooling
- Language-neutral: TypeScript and Python consume the same files
- Decouples definitions from any runtime implementation
- Diffable and reviewable by non-engineers (product, domain, compliance)
- No JSON noise (quotes, commas, brackets)

## How it works

1. Authors write YAML manifests and entity files in `examples/`
2. The TypeScript runtime (`@ikary/loader`) parses YAML, strips meta-properties, validates via Zod
3. The engine (`@ikary/engine`) compiles validated manifests into runtime-ready structures
4. Python consumers use the YAML schemas for structural validation

## Shared artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| YAML manifests | `examples/` | Complete manifest examples |
| YAML entity files | `examples/entities/` | Composable standalone entities |
| YAML schemas | Domain folders (`entities/`, `pages/`, etc.) | Language-neutral structural validation |
| Bundled JSON Schema | `node/dist/schemas/` (generated) | Tooling that requires single-file JSON |
