import { Injectable } from '@nestjs/common';
import {
  validateManifest,
  EntityDefinitionSchema,
  validateSingleEntitySemantics,
} from '@ikary/contract';
import type { ValidationError } from '@ikary/contract';
import { z } from 'zod';
import { compileCellApp, isValidationResult } from '@ikary/engine';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export interface NormalizeResult {
  valid: boolean;
  manifest?: unknown;
  errors: Array<{ field: string; message: string }>;
}

@Injectable()
export class ValidationService {
  validateManifest(manifest: unknown): ValidationResult {
    try {
      const result = validateManifest(manifest);
      return {
        valid: result.valid,
        errors: result.errors.map(mapError),
      };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }

  validateEntity(entity: unknown): ValidationResult {
    try {
      const parseResult = EntityDefinitionSchema.safeParse(entity);
      if (!parseResult.success) {
        return {
          valid: false,
          errors: parseResult.error.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join('.') || 'root',
            message: issue.message,
          })),
        };
      }

      const semanticErrors = validateSingleEntitySemantics(parseResult.data);
      return {
        valid: semanticErrors.length === 0,
        errors: semanticErrors.map(mapError),
      };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }

  validatePage(page: unknown): ValidationResult {
    try {
      // Basic structural validation for page definitions
      const PageSchema = z.object({
        key: z.string().min(1),
        type: z.string().min(1),
        title: z.string().min(1),
        path: z.string().min(1),
        entity: z.string().optional(),
      }).passthrough();

      const parseResult = PageSchema.safeParse(page);
      if (!parseResult.success) {
        return {
          valid: false,
          errors: parseResult.error.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join('.') || 'root',
            message: issue.message,
          })),
        };
      }
      return { valid: true, errors: [] };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }

  normalizeManifest(manifest: unknown): NormalizeResult {
    try {
      const result = compileCellApp(manifest as any);
      if (isValidationResult(result)) {
        return {
          valid: false,
          errors: result.errors.map(mapError),
        };
      }
      return { valid: true, manifest: result, errors: [] };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }
}

function mapError(err: ValidationError): { field: string; message: string } {
  return { field: err.field, message: err.message };
}
