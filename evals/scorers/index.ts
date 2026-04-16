import type { EvalCase, ScorerResult } from '../core/case-schema';
import { assumptionsScorer } from './assumptions.scorer';
import { clarificationDecisionScorer } from './clarification-decision.scorer';
import { clarificationQuestionShapeScorer } from './clarification-question-shape.scorer';
import { contextAssemblyScorer } from './context-assembly.scorer';
import { e2eSuccessScorer } from './e2e-success.scorer';
import { expectedEntitiesScorer } from './expected-entities.scorer';
import { expectedPagesScorer } from './expected-pages.scorer';
import { expectedPrimitivesScorer } from './expected-primitives.scorer';
import { expectedRelationsScorer } from './expected-relations.scorer';
import { forbiddenItemsScorer } from './forbidden-items.scorer';
import { parseValidScorer } from './parse-valid.scorer';
import { preservationScorer } from './preservation.scorer';
import { requiredFieldsScorer } from './required-fields.scorer';
import { retrievalAlignmentScorer } from './retrieval-alignment.scorer';
import { runtimeScorer } from './runtime.scorer';
import { schemaValidScorer } from './schema-valid.scorer';
import { semanticValidScorer } from './semantic-valid.scorer';

export type EvalScorer = (testCase: EvalCase, result: unknown) => ScorerResult;

export const DEFAULT_SCORERS: EvalScorer[] = [
  parseValidScorer,
  schemaValidScorer,
  semanticValidScorer,
  expectedEntitiesScorer,
  expectedRelationsScorer,
  expectedPagesScorer,
  expectedPrimitivesScorer,
  requiredFieldsScorer,
  forbiddenItemsScorer,
  preservationScorer,
  runtimeScorer,
  retrievalAlignmentScorer,
  contextAssemblyScorer,
  clarificationDecisionScorer,
  clarificationQuestionShapeScorer,
  assumptionsScorer,
  e2eSuccessScorer,
];

export function runDefaultScorers(testCase: EvalCase, result: unknown): ScorerResult[] {
  return DEFAULT_SCORERS.map((scorer) => scorer(testCase, result));
}
