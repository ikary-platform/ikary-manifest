import { CellManifestV1Schema, validateBusinessRules } from '@ikary/contract';
import type { CellManifestV1, ValidationResult } from '@ikary/contract';
import { normalizeManifest } from './normalize-manifest';

export function compileCellApp(manifest: CellManifestV1): CellManifestV1 | ValidationResult {
  const parseResult = CellManifestV1Schema.safeParse(manifest);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    }));
    return { valid: false, errors };
  }

  const businessErrors = validateBusinessRules(parseResult.data);
  if (businessErrors.length > 0) {
    return { valid: false, errors: businessErrors };
  }

  return normalizeManifest(parseResult.data);
}

export function isValidationResult(result: CellManifestV1 | ValidationResult): result is ValidationResult {
  return 'valid' in result;
}
