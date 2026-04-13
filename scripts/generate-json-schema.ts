/**
 * Generates bundled JSON Schema from the TypeScript/Zod contract.
 *
 * Writes to `<repoRoot>/dist/schemas/` — consumed by tooling that needs
 * single-file JSON Schema (e.g. Python's jsonschema library). Human-readable
 * YAML schemas live under `manifests/` and are hand-authored with $ref
 * cross-references.
 *
 * Usage: pnpm generate:schema
 */
import { zodToJsonSchema } from 'zod-to-json-schema';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CellManifestV1Schema,
  EntityDefinitionSchema,
} from '@ikary/cell-contract';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_DIR = join(REPO_ROOT, 'dist', 'schemas');

const schemas = [
  {
    name: 'CellManifestV1',
    schema: CellManifestV1Schema,
    description: 'Top-level Cell manifest schema (apiVersion, kind, metadata, spec)',
  },
  {
    name: 'EntityDefinition',
    schema: EntityDefinitionSchema,
    description: 'Entity definition schema (fields, relations, computed, lifecycle, capabilities, policies)',
  },
] as const;

mkdirSync(OUT_DIR, { recursive: true });

for (const { name, schema, description } of schemas) {
  const jsonSchema = zodToJsonSchema(schema, {
    name,
    $refStrategy: 'none',
  });

  if (typeof jsonSchema === 'object' && jsonSchema !== null) {
    (jsonSchema as Record<string, unknown>)['description'] = description;
  }

  const outPath = join(OUT_DIR, `${name}.schema.json`);
  writeFileSync(outPath, JSON.stringify(jsonSchema, null, 2) + '\n');
  console.log(`Generated: ${outPath}`);
}

console.log(`\nDone. ${schemas.length} bundled schema(s) written to ${OUT_DIR}`);
