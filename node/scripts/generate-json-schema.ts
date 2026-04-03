/**
 * Generates language-neutral JSON Schema files from the TypeScript/Zod contract.
 *
 * Output goes to manifests/schemas/ so Python (and other languages) can validate
 * manifests without depending on the TypeScript runtime.
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
const OUT_DIR = join(__dirname, '..', '..', 'manifests', 'schemas');

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

  // Add a description to the top-level schema
  if (typeof jsonSchema === 'object' && jsonSchema !== null) {
    (jsonSchema as Record<string, unknown>)['description'] = description;
  }

  const outPath = join(OUT_DIR, `${name}.schema.json`);
  writeFileSync(outPath, JSON.stringify(jsonSchema, null, 2) + '\n');
  console.log(`Generated: ${outPath}`);
}

console.log(`\nDone. ${schemas.length} schema(s) written to ${OUT_DIR}`);
