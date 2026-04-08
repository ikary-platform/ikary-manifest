import { parse as parseYaml } from 'yaml';
import { parseManifest, validateManifest } from '@ikary/contract';
import { stripMeta } from './strip-meta';
import type { LoadManifestResult, LoadManifestOptions } from './types';

/**
 * Parse a YAML string into a validated CellManifestV1.
 *
 * Pipeline: YAML string -> strip $schema/$ref -> Zod parse -> semantic validation
 *
 * Meta-properties ($schema, unresolved $ref entries) are stripped before
 * validation. Full $ref resolution (loading referenced files) is handled
 * by loadManifestFromFile with the resolve option.
 */
export function loadManifestFromYaml(
  yamlContent: string,
  options?: LoadManifestOptions,
): LoadManifestResult {
  let raw: unknown;
  try {
    raw = parseYaml(yamlContent);
  } catch (err) {
    return {
      valid: false,
      errors: [
        {
          field: 'root',
          message: `YAML parse error: ${err instanceof Error ? err.message : /* v8 ignore next */ String(err)}`,
        },
      ],
      raw: undefined,
    };
  }

  const cleaned = stripMeta(raw);
  const result = options?.structuralOnly ? parseManifest(cleaned) : validateManifest(cleaned);

  return { ...result, raw };
}
