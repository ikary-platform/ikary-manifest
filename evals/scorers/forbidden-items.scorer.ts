import { scoreIdentifiers, getManifest } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function forbiddenItemsScorer(testCase: EvalCase, result: unknown) {
  return scoreIdentifiers('forbiddenItemsScorer', testCase.expected.forbiddenItems, getManifest(result), 'absent');
}
