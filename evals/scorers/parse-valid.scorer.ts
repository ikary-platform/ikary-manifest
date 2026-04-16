import { makeScorerResult, getValidationStage } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function parseValidScorer(_testCase: EvalCase, result: unknown) {
  const stage = getValidationStage(result, 'parse');
  if (!stage) return makeScorerResult('parseValidScorer', false, ['Parse stage missing from trace.']);
  return makeScorerResult('parseValidScorer', stage.passed, stage.errors, stage);
}
