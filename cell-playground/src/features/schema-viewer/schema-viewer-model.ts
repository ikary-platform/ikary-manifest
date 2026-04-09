import * as CellSchemaSymbols from '@ikary/cell-contract-core';
import { CELL_SCHEMA_CATALOG, type SchemaCatalogEntry } from '@ikary/cell-contract-core';
import type { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface SchemaFieldSummary {
  readonly key: string;
  readonly type: string;
  readonly required: boolean;
}

export interface SchemaViewerIndexEntry extends SchemaCatalogEntry {
  readonly zodTypeName: string;
  readonly referencedBy: readonly string[];
  readonly isAvailable: boolean;
}

export interface SchemaViewerDetail extends SchemaViewerIndexEntry {
  readonly jsonSchema: Record<string, unknown>;
  readonly exampleJson: JsonValue;
  readonly topLevelFields: readonly SchemaFieldSummary[];
}

const SYMBOL_TABLE = CellSchemaSymbols as Record<string, unknown>;
const DETAIL_CACHE = new Map<string, SchemaViewerDetail>();
const HUMAN_CONTRACT_MD_CACHE = new Map<string, string | null>();
const HUMAN_CONTRACT_MD_LOADERS = import.meta.glob(
  [
    '../../../../../libs/cell-contract-core/src/contract/**/*.md',
    '!../../../../../libs/cell-contract-core/src/contract/**/*.llm.md',
  ],
  {
    query: '?raw',
    import: 'default',
  },
);

const referencedByMap = new Map<string, string[]>();
for (const entry of CELL_SCHEMA_CATALOG) {
  for (const refName of entry.references) {
    const list = referencedByMap.get(refName);
    if (list) {
      list.push(entry.name);
    } else {
      referencedByMap.set(refName, [entry.name]);
    }
  }
}

const INDEX_ENTRIES: readonly SchemaViewerIndexEntry[] = CELL_SCHEMA_CATALOG.map((entry) => {
  const candidate = SYMBOL_TABLE[entry.name];
  return {
    ...entry,
    isAvailable: isZodSchema(candidate),
    zodTypeName: getZodTypeName(candidate),
    referencedBy: referencedByMap.get(entry.name) ?? [],
  };
});

export const SCHEMA_VIEWER_INDEX: readonly SchemaViewerIndexEntry[] = INDEX_ENTRIES;

export function getSchemaViewerDetail(schemaName: string): SchemaViewerDetail | null {
  const cached = DETAIL_CACHE.get(schemaName);
  if (cached) {
    return cached;
  }

  const indexEntry = INDEX_ENTRIES.find((entry) => entry.name === schemaName);
  if (!indexEntry) {
    return null;
  }

  const schemaCandidate = SYMBOL_TABLE[schemaName];
  if (!isZodSchema(schemaCandidate)) {
    return null;
  }

  const jsonSchema = zodToJsonSchema(schemaCandidate, {
    name: schemaName,
    $refStrategy: 'root',
  }) as Record<string, unknown>;

  const detail: SchemaViewerDetail = {
    ...indexEntry,
    jsonSchema,
    exampleJson: generateExampleFromJsonSchema(jsonSchema),
    topLevelFields: summarizeTopLevelFields(jsonSchema),
  };

  DETAIL_CACHE.set(schemaName, detail);
  return detail;
}

export async function getSchemaHumanContractMarkdown(sourcePath: string): Promise<string | null> {
  const cacheKey = sourcePath;
  if (HUMAN_CONTRACT_MD_CACHE.has(cacheKey)) {
    return HUMAN_CONTRACT_MD_CACHE.get(cacheKey) ?? null;
  }

  const humanContractPath = getSchemaHumanContractPath(sourcePath);
  if (!humanContractPath) {
    HUMAN_CONTRACT_MD_CACHE.set(cacheKey, null);
    return null;
  }

  const loader = HUMAN_CONTRACT_MD_LOADERS[humanContractPath];
  if (!loader) {
    HUMAN_CONTRACT_MD_CACHE.set(cacheKey, null);
    return null;
  }

  try {
    const loaded = await loader();
    const markdown = typeof loaded === 'string' ? loaded : null;
    HUMAN_CONTRACT_MD_CACHE.set(cacheKey, markdown);
    return markdown;
  } catch {
    HUMAN_CONTRACT_MD_CACHE.set(cacheKey, null);
    return null;
  }
}

export function getSchemaHumanContractPath(sourcePath: string): string | null {
  if (!sourcePath.startsWith('src/contract/') || !sourcePath.endsWith('.ts')) {
    return null;
  }

  const relativeContractPath = sourcePath.replace('src/contract/', '').replace(/\.ts$/, '.md');

  return `../../../../../libs/cell-contract-core/src/contract/${relativeContractPath}`;
}

function isZodSchema(value: unknown): value is ZodTypeAny {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return typeof (value as { safeParse?: unknown }).safeParse === 'function';
}

function getZodTypeName(value: unknown): string {
  if (!isZodSchema(value)) {
    return 'Unavailable';
  }

  const typeName = (value as { _def?: { typeName?: string } })._def?.typeName;
  return typeof typeName === 'string' ? typeName : 'ZodType';
}

function summarizeTopLevelFields(rootSchema: Record<string, unknown>): readonly SchemaFieldSummary[] {
  const rootNode = resolveRootNode(rootSchema);
  const properties = asRecord(rootNode?.properties);
  const required = new Set(toStringArray(rootNode?.required));

  if (!properties) {
    return [];
  }

  return Object.keys(properties)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const propertySchema = asRecord(properties[key]);
      return {
        key,
        required: required.has(key),
        type: describeSchemaType(propertySchema),
      };
    });
}

const MAX_EXAMPLE_DEPTH = 8;
const MAX_REF_VISITS = 2;

function generateExampleFromJsonSchema(rootSchema: Record<string, unknown>): JsonValue {
  const rootNode = resolveRootNode(rootSchema);
  return generateExampleNode(rootSchema, rootNode ?? rootSchema, {
    depth: 0,
    path: [],
    refVisits: new Map(),
  });
}

interface GenerationContext {
  depth: number;
  path: string[];
  refVisits: Map<string, number>;
}

function generateExampleNode(
  rootSchema: Record<string, unknown>,
  nodeValue: unknown,
  context: GenerationContext,
): JsonValue {
  const node = asRecord(nodeValue);
  if (!node) {
    return 'sample';
  }

  if (context.depth >= MAX_EXAMPLE_DEPTH) {
    return sampleForDepthLimit(context.path);
  }

  const ref = readString(node.$ref);
  if (ref) {
    const refVisits = context.refVisits.get(ref) ?? 0;
    if (refVisits >= MAX_REF_VISITS) {
      return sampleForRefLimit(ref);
    }

    context.refVisits.set(ref, refVisits + 1);
    const resolved = resolveJsonPointer(rootSchema, ref);
    if (!resolved) {
      return sampleForRefLimit(ref);
    }

    return generateExampleNode(rootSchema, resolved, {
      ...context,
      depth: context.depth + 1,
    });
  }

  const constValue = toJsonValue(node.const);
  if (constValue !== null) {
    return constValue;
  }

  const enumValues = asArray(node.enum);
  if (enumValues && enumValues.length > 0) {
    const firstEnumValue = toJsonValue(enumValues[0]);
    if (firstEnumValue !== null) {
      return firstEnumValue;
    }
  }

  const allOf = asArray(node.allOf);
  if (allOf && allOf.length > 0) {
    const merged = allOf.reduce<JsonValue>((accumulator, item) => {
      const generated = generateExampleNode(rootSchema, item, {
        ...context,
        depth: context.depth + 1,
      });

      if (isJsonObject(accumulator) && isJsonObject(generated)) {
        return { ...accumulator, ...generated };
      }

      return accumulator;
    }, {});

    if (Object.keys(merged as object).length > 0) {
      return merged;
    }
  }

  const oneOf = asArray(node.oneOf);
  if (oneOf && oneOf.length > 0) {
    return generateExampleNode(rootSchema, oneOf[0], {
      ...context,
      depth: context.depth + 1,
    });
  }

  const anyOf = asArray(node.anyOf);
  if (anyOf && anyOf.length > 0) {
    return generateExampleNode(rootSchema, anyOf[0], {
      ...context,
      depth: context.depth + 1,
    });
  }

  const schemaType = resolveSchemaType(node);
  if (schemaType === 'object' || node.properties !== undefined || node.additionalProperties !== undefined) {
    return generateObjectExample(rootSchema, node, {
      ...context,
      depth: context.depth + 1,
    });
  }

  if (schemaType === 'array' || node.items !== undefined) {
    return generateArrayExample(rootSchema, node, {
      ...context,
      depth: context.depth + 1,
    });
  }

  if (schemaType === 'string') {
    const defaultString = readString(node.default);
    if (defaultString) {
      return defaultString;
    }
    return sampleStringForPath(context.path, readString(node.format));
  }

  if (schemaType === 'boolean') {
    const defaultBoolean = readBoolean(node.default);
    return defaultBoolean ?? true;
  }

  if (schemaType === 'integer') {
    const defaultNumber = readNumber(node.default);
    return defaultNumber ?? 1;
  }

  if (schemaType === 'number') {
    const defaultNumber = readNumber(node.default);
    return defaultNumber ?? 1.25;
  }

  if (schemaType === 'null') {
    return null;
  }

  const defaultValue = toJsonValue(node.default);
  if (defaultValue !== null) {
    return defaultValue;
  }

  return sampleStringForPath(context.path, readString(node.format));
}

function generateObjectExample(
  rootSchema: Record<string, unknown>,
  node: Record<string, unknown>,
  context: GenerationContext,
): JsonValue {
  const result: Record<string, JsonValue> = {};
  const properties = asRecord(node.properties);
  const required = new Set(toStringArray(node.required));

  if (properties) {
    const propertyKeys = [...required, ...Object.keys(properties).filter((key) => !required.has(key))];

    for (const key of propertyKeys) {
      const propertySchema = properties[key];
      result[key] = generateExampleNode(rootSchema, propertySchema, {
        ...context,
        path: [...context.path, key],
      });
    }
  }

  const additionalProperties = asRecord(node.additionalProperties);
  if (additionalProperties) {
    result.additional_property = generateExampleNode(rootSchema, additionalProperties, {
      ...context,
      path: [...context.path, 'additional_property'],
    });
  }

  return result;
}

function generateArrayExample(
  rootSchema: Record<string, unknown>,
  node: Record<string, unknown>,
  context: GenerationContext,
): JsonValue {
  const tupleItems = asArray(node.items);
  if (tupleItems) {
    return tupleItems.map((item, index) =>
      generateExampleNode(rootSchema, item, {
        ...context,
        path: [...context.path, String(index)],
      }),
    );
  }

  const itemSchema = asRecord(node.items) ?? {};
  const minItems = readNumber(node.minItems);
  const count = minItems && minItems > 1 ? Math.min(Math.floor(minItems), 2) : 1;

  const items: JsonValue[] = [];
  for (let index = 0; index < count; index += 1) {
    items.push(
      generateExampleNode(rootSchema, itemSchema, {
        ...context,
        path: [...context.path, String(index)],
      }),
    );
  }

  return items;
}

function resolveRootNode(schema: Record<string, unknown>): Record<string, unknown> | null {
  const rootRef = readString(schema.$ref);
  if (!rootRef) {
    return schema;
  }

  return resolveJsonPointer(schema, rootRef);
}

function resolveJsonPointer(rootSchema: Record<string, unknown>, ref: string): Record<string, unknown> | null {
  if (!ref.startsWith('#/')) {
    return null;
  }

  const segments = ref
    .slice(2)
    .split('/')
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'));

  let current: unknown = rootSchema;
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number.parseInt(segment, 10);
      if (!Number.isFinite(index) || index < 0 || index >= current.length) {
        return null;
      }
      current = current[index];
      continue;
    }

    const currentRecord = asRecord(current);
    if (!currentRecord || !(segment in currentRecord)) {
      return null;
    }

    current = currentRecord[segment];
  }

  return asRecord(current);
}

function resolveSchemaType(node: Record<string, unknown>): string | null {
  const typeValue = node.type;
  if (typeof typeValue === 'string') {
    return typeValue;
  }

  if (Array.isArray(typeValue)) {
    const normalized = typeValue.find((entry) => entry !== 'null');
    return typeof normalized === 'string' ? normalized : null;
  }

  return null;
}

function describeSchemaType(node: Record<string, unknown> | null): string {
  if (!node) {
    return 'unknown';
  }

  const constValue = toJsonValue(node.const);
  if (constValue !== null) {
    return `const:${String(constValue)}`;
  }

  const enumValues = asArray(node.enum);
  if (enumValues && enumValues.length > 0) {
    return `enum(${enumValues.length})`;
  }

  if (node.$ref) {
    const ref = readString(node.$ref);
    return ref ? `ref:${ref}` : 'ref';
  }

  const schemaType = resolveSchemaType(node);
  if (schemaType) {
    return schemaType;
  }

  if (node.properties) {
    return 'object';
  }

  if (node.items) {
    return 'array';
  }

  if (node.anyOf || node.oneOf) {
    return 'union';
  }

  return 'unknown';
}

function sampleStringForPath(path: string[], format: string | null): string {
  if (format === 'email') {
    return 'user@example.com';
  }
  if (format === 'date') {
    return '2026-01-01';
  }
  if (format === 'date-time') {
    return '2026-01-01T09:00:00Z';
  }
  if (format === 'uuid') {
    return '00000000-0000-4000-8000-000000000001';
  }
  if (format === 'uri' || format === 'url') {
    return 'https://example.com/resource';
  }

  const last = path[path.length - 1]?.toLowerCase() ?? '';

  if (last === 'key') return 'sample_key';
  if (last === 'name') return 'Sample Name';
  if (last.includes('title')) return 'Sample Title';
  if (last.includes('id')) return 'sample-id-001';
  if (last.includes('email')) return 'user@example.com';
  if (last.includes('path')) return '/sample/path';
  if (last.includes('event')) return 'entity.created';
  if (last.includes('scope')) return 'workspace:read';
  if (last.includes('message')) return 'Sample message';
  if (last.includes('label')) return 'Sample label';
  if (last.includes('description')) return 'Sample description';
  if (last.includes('type')) return 'string';
  if (last.includes('field')) return 'status';
  if (last.includes('entity')) return 'ticket';

  return `sample_${last || 'value'}`;
}

function sampleForDepthLimit(path: string[]): JsonValue {
  const leaf = path[path.length - 1] ?? 'node';
  return `<depth-limit:${leaf}>`;
}

function sampleForRefLimit(ref: string): JsonValue {
  return `<recursive:${ref}>`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function toJsonValue(value: unknown): JsonValue | null {
  if (value === undefined) {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return null;
  }
}

function isJsonObject(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
