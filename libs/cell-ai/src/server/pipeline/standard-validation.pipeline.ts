import { Injectable } from '@nestjs/common';
import {
  parseManifest,
  validateManifestSemantics,
} from '@ikary/cell-contract';
import { compileCellApp, isValidationResult } from '@ikary/cell-engine';
import type { ValidationPipeline, ValidationPipelineResult } from './interfaces';

interface ValidationErrorLike {
  readonly field: string;
  readonly message: string;
}

@Injectable()
export class StandardValidationPipeline implements ValidationPipeline {
  readonly name = 'standard-validation-pipeline';

  async validate(input: {
    manifest: unknown;
  }): Promise<ValidationPipelineResult> {
    const stages: ValidationPipelineResult['stages'] = [];

    const parseStage = typeof input.manifest === 'object' && input.manifest !== null
      ? { stage: 'parse' as const, passed: true, errors: [] }
      : { stage: 'parse' as const, passed: false, errors: ['Manifest output is not an object.'] };
    stages.push(parseStage);
    if (!parseStage.passed) {
      return { valid: false, stages };
    }

    const schemaResult = parseManifest(input.manifest);
    stages.push({
      stage: 'schema',
      passed: schemaResult.valid,
      errors: schemaResult.errors.map((error) => `${error.field}: ${error.message}`),
      evidence: schemaResult.manifest,
    });
    if (!schemaResult.valid || !schemaResult.manifest) {
      return { valid: false, stages };
    }

    const semanticErrors = validateManifestSemantics(schemaResult.manifest);
    stages.push({
      stage: 'semantic',
      passed: semanticErrors.length === 0,
      errors: semanticErrors.map((error) => `${error.field}: ${error.message}`),
      evidence: schemaResult.manifest,
    });
    if (semanticErrors.length > 0) {
      return { valid: false, stages };
    }

    const compileResult = compileCellApp(schemaResult.manifest);
    if (isValidationResult(compileResult)) {
      stages.push({
        stage: 'compile',
        passed: false,
        errors: compileResult.errors.map((error: ValidationErrorLike) => `${error.field}: ${error.message}`),
      });
      return { valid: false, stages };
    }

    stages.push({
      stage: 'compile',
      passed: true,
      errors: [],
      evidence: compileResult,
    });

    stages.push({
      stage: 'runtime',
      passed: true,
      errors: [],
      evidence: { mode: 'compile-only' },
    });

    return {
      valid: true,
      stages,
      compiledManifest: compileResult,
    };
  }
}
