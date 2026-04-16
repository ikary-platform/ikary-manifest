import { scoreExpectedCollection, primitiveKeys, getManifest } from './helpers';
import type { EvalCase } from '../core/case-schema';

export function expectedPrimitivesScorer(testCase: EvalCase, result: unknown) {
  return scoreExpectedCollection('expectedPrimitivesScorer', testCase.expected.primitives, primitiveKeys(getManifest(result)));
}
