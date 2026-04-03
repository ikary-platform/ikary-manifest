# Manifests

This directory is the **language-neutral source of truth** for Ikary cell definitions.

## Structure

```
manifests/
  entities/       # Standalone entity YAML fragments (composable)
  examples/       # Complete Cell manifest examples
  schemas/        # Generated JSON Schema files
```

## Why YAML?

YAML is the authoring format for cell manifests because:

- It is readable and writable by humans without tooling
- It is language-neutral -- both TypeScript and Python runtimes consume the same files
- It decouples the manifest definition from any specific runtime implementation
- It allows non-developers (product owners, domain experts) to review and author contracts

## How it works

1. Authors write or edit YAML manifests in this directory
2. The TypeScript runtime (`@ikary-manifest/loader`) parses YAML into JSON objects
3. Zod schemas (`@ikary-manifest/contract`) validate and normalize the parsed objects
4. The engine (`@ikary-manifest/engine`) compiles validated manifests into runtime-ready structures
5. Python consumers use the generated JSON Schema files for structural validation

## Shared artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| YAML manifests | `entities/`, `examples/` | Authoring source of truth |
| JSON Schema | `schemas/` | Language-neutral structural validation |
| Normalized JSON | Generated at runtime | Runtime consumption by any language |
