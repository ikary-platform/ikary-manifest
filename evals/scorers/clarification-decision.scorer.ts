import type { EvalCase } from '../core/case-schema';
import { getInitialResult, makeScorerResult } from './helpers';

export function clarificationDecisionScorer(testCase: EvalCase, result: unknown) {
  const shouldAsk = testCase.expected.clarification.shouldAsk;
  const initial = getInitialResult(result);
  if (shouldAsk === undefined) {
    return makeScorerResult('clarificationDecisionScorer', true, [], { status: initial.status }, 1);
  }
  const asked = initial.status === 'needs_clarification';
  return makeScorerResult(
    'clarificationDecisionScorer',
    shouldAsk === asked,
    shouldAsk === asked ? [] : [`Expected shouldAsk=${shouldAsk} but got status ${String(initial.status ?? 'unknown')}.`],
    { shouldAsk, status: initial.status },
  );
}
