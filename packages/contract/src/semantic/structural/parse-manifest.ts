import { CellManifestV1Schema } from '../../contract/manifest/CellManifestV1Schema';
import type { CellManifestV1, ValidationError } from '../../shared/types';
import { toStructuralValidationErrors } from './structural-errors';

export interface ParsedManifestResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly manifest?: CellManifestV1;
}

export function parseManifest(manifest: unknown): ParsedManifestResult {
  const parsed = CellManifestV1Schema.safeParse(manifest);

  if (!parsed.success) {
    return {
      valid: false,
      errors: toStructuralValidationErrors(parsed.error.issues),
    };
  }

  return {
    valid: true,
    errors: [],
    manifest: parsed.data,
  };
}
