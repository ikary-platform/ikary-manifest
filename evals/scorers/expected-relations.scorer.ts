import { scoreExpectedCollection, relationKeys, getManifest } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function expectedRelationsScorer(testCase: EvalCase, result: unknown) {
  return scoreExpectedCollection('expectedRelationsScorer', testCase.expected.relations, relationKeys(getManifest(result)));
}
