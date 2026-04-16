import { makeScorerResult, getValidationStage } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function schemaValidScorer(_testCase: EvalCase, result: unknown) {
  const stage = getValidationStage(result, 'schema');
  if (!stage) return makeScorerResult('schemaValidScorer', false, ['Schema stage missing from trace.']);
  return makeScorerResult('schemaValidScorer', stage.passed, stage.errors, stage);
}
