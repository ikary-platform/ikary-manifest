# @ikary-manifest/loader

YAML and JSON manifest loading, parsing, and validation.

## Install

```bash
pnpm add @ikary-manifest/loader
```

## API

### `loadManifestFromYaml(yamlContent, options?)`

Parse a YAML string into a validated `CellManifestV1`.

```typescript
import { loadManifestFromYaml } from '@ikary-manifest/loader';

const result = loadManifestFromYaml(`
apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: my_app
  name: My App
  version: "1.0.0"
spec:
  mount:
    mountPath: /
    landingPage: dash
  pages:
    - key: dash
      type: dashboard
      title: Dashboard
      path: /dashboard
`);

if (result.valid) {
  console.log(result.manifest); // CellManifestV1
}
```

### `loadManifestFromJson(jsonContent, options?)`

Parse a JSON string into a validated `CellManifestV1`. Same interface as YAML.

### `loadManifestFromFile(filePath, options?)`

Load a manifest from a `.yaml`, `.yml`, or `.json` file. Detects format by extension.

```typescript
import { loadManifestFromFile } from '@ikary-manifest/loader';

const result = await loadManifestFromFile('manifests/examples/crm-manifest.yaml');
```

## Options

```typescript
interface LoadManifestOptions {
  /** Skip semantic validation (only structural Zod parse). Default: false */
  structuralOnly?: boolean;
}
```

## Result

```typescript
interface LoadManifestResult {
  valid: boolean;
  errors: ValidationError[];   // { field: string; message: string }
  manifest?: CellManifestV1;   // Present when valid
  raw?: unknown;               // The raw parsed object before validation
}
```

## Meta-property handling

The loader strips YAML/JSON Schema meta-properties before Zod validation:

- **`$schema`**: authoring hint, removed from root and nested objects
- **`$ref`**: unresolved file references in entity arrays are filtered out

This allows manifests to use standard `$schema` declarations and `$ref` composition without breaking Zod's strict-mode validation.
