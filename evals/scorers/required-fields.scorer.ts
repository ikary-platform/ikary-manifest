import { scoreFieldPaths, getManifest } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function requiredFieldsScorer(testCase: EvalCase, result: unknown) {
  return scoreFieldPaths('requiredFieldsScorer', testCase.expected.requiredFields, getManifest(result));
}
