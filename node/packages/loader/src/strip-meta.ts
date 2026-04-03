/**
 * Strips YAML/JSON Schema meta-properties ($schema, $ref) from a parsed
 * manifest object before Zod validation.
 *
 * - $schema is an authoring hint (which schema this document conforms to)
 * - $ref in entity arrays signals file-based composition (resolved separately)
 *
 * These are standard JSON Schema conventions that Zod's .strict() mode
 * would reject as unknown properties.
 */
export function stripMeta(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    // Filter out $ref-only objects (unresolved file references) and recurse
    return obj
      .filter((item) => !(isPlainObject(item) && '$ref' in item && Object.keys(item).length === 1))
      .map(stripMeta);
  }

  const record = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (key === '$schema') continue;
    result[key] = stripMeta(value);
  }

  return result;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
