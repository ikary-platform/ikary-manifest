import { scoreIdentifiers, getManifest } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function preservationScorer(testCase: EvalCase, result: unknown) {
  return scoreIdentifiers('preservationScorer', testCase.expected.preservationRules, getManifest(result), 'present');
}
