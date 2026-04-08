import { parseManifest, validateManifest } from '@ikary/contract';
import { stripMeta } from './strip-meta';
import type { LoadManifestResult, LoadManifestOptions } from './types';

/**
 * Parse a JSON string into a validated CellManifestV1.
 */
export function loadManifestFromJson(
  jsonContent: string,
  options?: LoadManifestOptions,
): LoadManifestResult {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonContent);
  } catch (err) {
    return {
      valid: false,
      errors: [
        {
          field: 'root',
          message: `JSON parse error: ${err instanceof Error ? err.message : /* v8 ignore next */ String(err)}`,
        },
      ],
      raw: undefined,
    };
  }

  const cleaned = stripMeta(raw);
  const result = options?.structuralOnly ? parseManifest(cleaned) : validateManifest(cleaned);

  return { ...result, raw };
}
