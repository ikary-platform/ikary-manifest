import type { EvalCase } from '../core/case-schema';
import { getTrace, makeScorerResult } from './helpers';

export function retrievalAlignmentScorer(testCase: EvalCase, result: unknown) {
  const expected = testCase.expected.expectedRetrievalItems;
  const trace = getTrace(result);
  const actual = Array.isArray(trace['retrievalHits'])
    ? (trace['retrievalHits'] as Array<{ id?: string; title?: string }>).flatMap((item) => [item.id, item.title].filter(Boolean) as string[])
    : [];

  if (expected.length === 0) {
    return makeScorerResult('retrievalAlignmentScorer', true, [], { actual }, 1);
  }

  const missing = expected.filter((item) => !actual.includes(item));
  return makeScorerResult(
    'retrievalAlignmentScorer',
    missing.length === 0,
    missing,
    { expected, actual },
    (expected.length - missing.length) / expected.length,
  );
}
