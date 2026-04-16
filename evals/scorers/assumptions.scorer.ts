import type { EvalCase } from '../core/case-schema';
import { getTrace, makeScorerResult } from './helpers';

export function assumptionsScorer(testCase: EvalCase, result: unknown) {
  const expected = testCase.expected.assumptions;
  const trace = getTrace(result);
  const actual = Array.isArray(trace['assumptions']) ? (trace['assumptions'] as string[]) : [];
  if (expected.length === 0) {
    return makeScorerResult('assumptionsScorer', true, [], { actual }, 1);
  }
  const missing = expected.filter((assumption) => !actual.includes(assumption));
  return makeScorerResult(
    'assumptionsScorer',
    missing.length === 0,
    missing,
    { expected, actual },
    (expected.length - missing.length) / expected.length,
  );
}
