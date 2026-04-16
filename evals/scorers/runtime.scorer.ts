import { makeScorerResult, getValidationStage } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function runtimeScorer(_testCase: EvalCase, result: unknown) {
  const stage = getValidationStage(result, 'runtime') ?? getValidationStage(result, 'compile');
  if (!stage) return makeScorerResult('runtimeScorer', false, ['Runtime or compile stage missing from trace.']);
  return makeScorerResult('runtimeScorer', stage.passed, stage.errors, stage);
}
