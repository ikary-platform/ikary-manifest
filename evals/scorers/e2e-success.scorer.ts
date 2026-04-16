import { getPrimaryResult, getValidationStage, makeScorerResult } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function e2eSuccessScorer(_testCase: EvalCase, result: unknown) {
  const primary = getPrimaryResult(result);
  const compileStage = getValidationStage(result, 'compile');
  const runtimeStage = getValidationStage(result, 'runtime');
  const passed = primary.status === 'completed'
    && Boolean(compileStage?.passed)
    && Boolean(runtimeStage?.passed ?? true);
  return makeScorerResult(
    'e2eSuccessScorer',
    passed,
    passed ? [] : ['End-to-end execution did not finish with a valid compiled manifest.'],
    { status: primary.status, compileStage, runtimeStage },
  );
}
