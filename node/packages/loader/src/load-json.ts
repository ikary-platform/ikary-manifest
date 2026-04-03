import { parseManifest, validateManifest } from '@ikary-manifest/contract';
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
          message: `JSON parse error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      raw: undefined,
    };
  }

  const result = options?.structuralOnly ? parseManifest(raw) : validateManifest(raw);

  return { ...result, raw };
}
