import type { EvalCase } from '../core/case-schema';
import { getTrace, makeScorerResult } from './helpers';

export function contextAssemblyScorer(testCase: EvalCase, result: unknown) {
  const expected = testCase.expected.expectedContextItems;
  const trace = getTrace(result);
  const summary = String(trace['contextSummary'] ?? '');
  const assembledContext = String(trace['assembledContext'] ?? '');
  const searchableText = `${summary}\n${assembledContext}`;

  if (expected.length === 0) {
    const hasContext = summary.length > 0 || assembledContext.length > 0;
    return makeScorerResult(
      'contextAssemblyScorer',
      hasContext,
      hasContext ? [] : ['Context summary was empty.'],
      { summary, assembledContext },
      hasContext ? 1 : 0,
    );
  }

  const missing = expected.filter((item) => !searchableText.toLowerCase().includes(item.toLowerCase()));
  return makeScorerResult(
    'contextAssemblyScorer',
    missing.length === 0,
    missing,
    { summary, assembledContext },
    (expected.length - missing.length) / expected.length,
  );
}
