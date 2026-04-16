import { scoreExpectedCollection, entityKeys, getManifest } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function expectedEntitiesScorer(testCase: EvalCase, result: unknown) {
  return scoreExpectedCollection('expectedEntitiesScorer', testCase.expected.entities, entityKeys(getManifest(result)));
}
