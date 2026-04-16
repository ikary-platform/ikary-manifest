import { makeScorerResult, getValidationStage } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function semanticValidScorer(_testCase: EvalCase, result: unknown) {
  const stage = getValidationStage(result, 'semantic');
  if (!stage) return makeScorerResult('semanticValidScorer', false, ['Semantic stage missing from trace.']);
  return makeScorerResult('semanticValidScorer', stage.passed, stage.errors, stage);
}
