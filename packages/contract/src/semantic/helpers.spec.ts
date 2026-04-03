import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { combineValidation, makeValidationResult } from './helpers';
import { toStructuralValidationErrors } from './structural/structural-errors';
import type { ValidationResult } from '../shared/types';

describe('validation helpers', () => {
  it('combines errors from multiple validation stages', () => {
    const structural: ValidationResult = {
      valid: false,
      errors: [{ field: 'spec.mount', message: 'invalid mount' }],
    };
    const semantic: ValidationResult = {
      valid: false,
      errors: [{ field: 'spec.pages', message: 'invalid page rules' }],
    };

    const merged = combineValidation(structural, semantic);

    expect(merged.valid).toBe(false);
    expect(merged.errors).toEqual([...structural.errors, ...semantic.errors]);
  });

  it('creates valid/invalid results from raw error arrays', () => {
    const ok = makeValidationResult([]);
    const failed = makeValidationResult([{ field: 'spec.entities[invoice].fields[status]', message: 'invalid enum' }]);

    expect(ok).toEqual({ valid: true, errors: [] });
    expect(failed).toEqual({
      valid: false,
      errors: [{ field: 'spec.entities[invoice].fields[status]', message: 'invalid enum' }],
    });
  });

  it('maps zod issue paths to structural validation errors', () => {
    const rootResult = z.string().safeParse(123);
    const nestedResult = z
      .object({
        spec: z.object({
          pages: z.array(z.object({ path: z.string().min(1) })),
        }),
      })
      .safeParse({
        spec: { pages: [{ path: '' }] },
      });

    expect(rootResult.success).toBe(false);
    expect(nestedResult.success).toBe(false);

    if (rootResult.success || nestedResult.success) {
      return;
    }

    const errors = toStructuralValidationErrors([rootResult.error.issues[0], nestedResult.error.issues[0]]);

    expect(errors[0]?.field).toBe('root');
    expect(errors[0]?.message).toBe(rootResult.error.issues[0]?.message);
    expect(errors[1]?.field).toBe('spec.pages.0.path');
    expect(errors[1]?.message).toBe(nestedResult.error.issues[0]?.message);
  });
});
