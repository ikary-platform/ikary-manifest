/**
 * Generates bundled JSON Schema from the TypeScript/Zod contract.
 *
 * Output goes to node/dist/schemas/ as a build artifact for tooling that
 * requires single-file JSON Schema (e.g. Python's jsonschema library).
 *
 * The human-readable YAML schemas live in manifests/schemas/ and are
 * hand-authored with $ref cross-references.
 *
 * Usage: tsx node/scripts/generate-json-schema.ts
 */
import { zodToJsonSchema } from 'zod-to-json-schema';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CellManifestV1Schema,
  EntityDefinitionSchema,
} from '@ikary-manifest/contract';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'dist', 'schemas');

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
