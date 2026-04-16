import { scoreExpectedCollection, pageKeys, getManifest } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function expectedPagesScorer(testCase: EvalCase, result: unknown) {
  return scoreExpectedCollection('expectedPagesScorer', testCase.expected.pages, pageKeys(getManifest(result)));
}
