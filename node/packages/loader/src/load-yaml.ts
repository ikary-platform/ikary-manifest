import { parse as parseYaml } from 'yaml';
import { parseManifest, validateManifest } from '@ikary-manifest/contract';
import type { LoadManifestResult, LoadManifestOptions } from './types';

/**
 * Parse a YAML string into a validated CellManifestV1.
 *
 * Pipeline: YAML string -> JS object -> Zod parse -> semantic validation
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
          message: `YAML parse error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      raw: undefined,
    };
  }

  const result = options?.structuralOnly ? parseManifest(raw) : validateManifest(raw);

  return { ...result, raw };
}
