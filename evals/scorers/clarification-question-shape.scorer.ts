import type { EvalCase } from '../core/case-schema';
import { compareExpectedQuestionIds, getInitialResult, makeScorerResult } from './helpers';

export function clarificationQuestionShapeScorer(testCase: EvalCase, result: unknown) {
  const initial = getInitialResult(result);
  if (!('questions' in initial)) {
    return makeScorerResult('clarificationQuestionShapeScorer', true, [], undefined, 1);
  }
  const questions = (initial as { questions?: Array<{ id?: string; question?: string; reason?: string; options?: unknown[] }> }).questions ?? [];
  const malformed = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => !question.id || !question.question || !question.reason || !Array.isArray(question.options))
    .map(({ index }) => `Question ${index} is missing required structured fields.`);
  const missingRequiredIds = compareExpectedQuestionIds(testCase, result);
  const diagnostics = [...malformed, ...missingRequiredIds];
  return makeScorerResult('clarificationQuestionShapeScorer', diagnostics.length === 0, diagnostics, questions, diagnostics.length === 0 ? 1 : 0);
}
