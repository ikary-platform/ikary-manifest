# Schema

The schema layer defines the structure of a manifest without depending on any language or runtime. It is the shared contract between all tools, runtimes, and languages in the IKARY ecosystem.

## What the schema layer contains

The `manifests/` directory holds two categories of files:

- **Source schemas**: JSON Schema written in YAML. They define what constitutes a valid manifest. Any tool that understands JSON Schema can consume them.
- **Example manifests**: YAML files that conform to those schemas. They demonstrate how to author a manifest.

No runtime code lives in this layer. No TypeScript, no Python, no framework references.

## Why YAML

YAML is the authoring format for IKARY manifests for several reasons.

**Human-readable.** A product owner, domain expert, or AI agent can read a YAML manifest without a code editor. The structure maps directly to application concepts: entities, pages, roles.

**LLM-friendly.** Models generate correct YAML reliably. The format is predictable, consistent, and well-represented in training data. Generating valid YAML is significantly simpler than generating idiomatic application code in any framework.

**Language-neutral.** Every major programming language ships a YAML parser in its standard library or first-party ecosystem. Python, Go, Rust, and Ruby can all parse the same manifest file without depending on Node.js.

**Diffable.** Manifest changes appear as readable diffs in pull requests. Reviewers can understand what changed in the application without reading code.

**IDE tooling via `$schema`.** Manifest files declare their schema with a `$schema` property. Editors use this to enable autocomplete, inline validation, and hover documentation while authoring.

## Why the schema stays agnostic

The YAML schemas under `manifests/` are structure definitions, not implementations. They describe what fields exist, what types they carry, and what values are valid. They say nothing about TypeScript, React, FastAPI, or any other technology.

Any runtime that can parse YAML and validate against JSON Schema can consume IKARY manifests. Adding support for a new language does not require changing the schemas.

## JSON Schema bridge

The TypeScript side of the project generates JSON Schema files from the Zod schemas in `@ikary/contract`:

```bash
pnpm -w run generate:schema
```

This produces `CellManifestV1.schema.json` and `EntityDefinition.schema.json` in `node/dist/schemas/`. Python, Go, or any other language uses these files to validate manifests structurally without a Node.js build step at runtime.

Known limitations of the generated JSON Schema:
- Recursive types (nested navigation items, nested fields) default to `any`
- `superRefine` validators do not translate; those are semantic rules enforced by the contract layer

## Schema cross-references

Schema files reference each other using the standard `$ref` keyword. An entity definition schema references field definitions, relation definitions, and lifecycle schemas:

```yaml
# entities/entity-definition.schema.yaml
properties:
  fields:
    type: array
    items:
      $ref: "./field-definition.schema.yaml"
  relations:
    type: array
    items:
      $ref: "./relation-definition.schema.yaml"
```

This keeps each schema file focused on a single concept while allowing composition across the full manifest structure.

## Full schema map

See [YAML Schemas](/reference/schemas) for the complete list of schema files, their purposes, and their cross-reference structure.
