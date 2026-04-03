import type { CellManifestV1, ValidationError } from '../shared/types';
import { parseManifest } from './structural/parse-manifest';
import { validateManifestSemantics } from './validate-manifest-semantics';

export interface ManifestValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly manifest?: CellManifestV1;
}

export function validateManifest(manifest: unknown): ManifestValidationResult {
  const parsed = parseManifest(manifest);

  if (!parsed.valid || !parsed.manifest) {
    return parsed;
  }

  const semanticErrors = validateManifestSemantics(parsed.manifest);
  if (semanticErrors.length > 0) {
    return {
      valid: false,
      errors: semanticErrors,
      manifest: parsed.manifest,
    };
  }

  return {
    valid: true,
    errors: [],
    manifest: parsed.manifest,
  };
}
