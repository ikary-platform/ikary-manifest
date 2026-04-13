/**
 * validation/helpers.ts — pure utility functions for ValidationResult
 *
 * These helpers are used throughout the compiler pipeline wherever multiple
 * validation passes need to be merged or a result object needs to be
 * constructed from a raw error list.
 *
 * They operate on the simple ValidationError / ValidationResult types
 * (field + message), not on the richer ValidationIssue format. The
 * distinction is intentional: ValidationResult is the internal compiler
 * contract; ValidationIssue is the runtime/API contract.
 */

import type { ValidationError, ValidationResult } from '../shared/types';

/**
 * Merges two or more ValidationResults into one.
 * The combined result is valid only if all inputs are valid.
 *
 * Typical use: combine the Zod parse result with the business-rule result
 * before deciding whether to proceed to compilation.
 *
 * @example
 * const combined = combineValidation(zodResult, businessRuleResult)
 * if (!combined.valid) return combined
 */
export function combineValidation(...results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap((r) => r.errors);
  return { valid: errors.length === 0, errors };
}

/**
 * Constructs a ValidationResult from a flat array of ValidationErrors.
 * `valid` is derived automatically — it is true iff the array is empty.
 *
 * @example
 * return makeValidationResult([
 *   { field: 'spec.mount.landingPage', message: 'Page key not found' },
 * ])
 */
export function makeValidationResult(errors: ValidationError[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}
