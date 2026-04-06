# Contract

The contract layer loads a manifest, validates its structure, and checks its business rules. It sits between the schema layer (YAML files) and the runtime layer (API and UI generators).

## What contract does

A contract implementation performs three steps:

1. **Load**: read a YAML or JSON file and parse it into a plain data object.
2. **Structural validation**: verify types, required fields, enum values, and field patterns against the schema.
3. **Semantic validation**: check business rules that the schema alone cannot express.

A manifest that passes both validation stages is ready to be compiled and handed to the runtime.

## Two validation stages

### Structural validation

Structural validation catches type mismatches and missing required fields. It runs against the JSON Schema (or Zod schema in TypeScript). The manifest fails here if a field has the wrong type, a required key is absent, or a value does not match its allowed pattern.

Examples:
- `version` field missing quotes (parsed as a float instead of a string)
- `type` field on an entity field set to an unrecognised value
- Required field `metadata.key` absent

### Semantic validation

Semantic validation checks rules that depend on the full manifest context. These cannot be expressed in a schema alone.

Examples:
- Two entities share the same `key`
- A lifecycle transition references a state not defined in that lifecycle
- A page references an entity key that does not exist in the manifest
- A navigation item references a page key that does not exist in the manifest

## TypeScript: `@ikary-manifest/contract`

The TypeScript implementation uses Zod. All types are inferred from Zod schemas, so there is no manual type duplication.

```typescript
import { loadManifestFromFile } from '@ikary-manifest/loader';
import { validateManifestSemantics } from '@ikary-manifest/contract';

const result = await loadManifestFromFile('app.yaml');

if (!result.valid) {
  console.error('Structural errors:', result.errors);
  process.exit(1);
}

const semanticErrors = validateManifestSemantics(result.manifest!);
if (semanticErrors.length > 0) {
  console.error('Semantic errors:', semanticErrors);
  process.exit(1);
}
```

`loadManifestFromFile` runs structural validation internally and returns a `LoadManifestResult` with a `valid` flag and a typed `manifest` object. `validateManifestSemantics` checks the business rules on the already-parsed manifest.

## Python: `ikary_manifest`

The Python implementation loads manifests and returns plain dictionaries. Structural and semantic validation are in active development.

```python
from ikary_manifest.loader import load_manifest_from_file

manifest = load_manifest_from_file("app.yaml")
print(manifest["metadata"]["key"])
```

## Related pages

- [Loading & Validation](/packages/loading): full API reference for loader, contract, and Python SDK
- [Compilation](/packages/engine): engine API reference
