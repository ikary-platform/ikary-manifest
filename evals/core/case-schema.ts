import { z } from 'zod';
import { manifestTaskTypeSchema, type ManifestTaskType } from '@ikary/cell-ai';

export const evalSuiteSchema = z.enum([
  'create',
  'fix',
  'update',
  'clarification',
  'retrieval',
  'context',
  'e2e',
]);
export type EvalSuite = z.infer<typeof evalSuiteSchema>;

export const evalCaseTypeSchema = z.enum([
  'create',
  'fix',
  'update',
  'retrieval',
  'context',
  'clarification',
  'e2e',
]);
export type EvalCaseType = z.infer<typeof evalCaseTypeSchema>;

export const evalCaseExpectationSchema = z.object({
  entities: z.array(z.string()).default([]),
  relations: z.array(z.string()).default([]),
  pages: z.array(z.string()).default([]),
  primitives: z.array(z.string()).default([]),
  requiredFields: z.array(z.string()).default([]),
  forbiddenItems: z.array(z.string()).default([]),
  preservationRules: z.array(z.string()).default([]),
  expectedRetrievalItems: z.array(z.string()).default([]),
  expectedContextItems: z.array(z.string()).default([]),
  clarification: z.object({
    shouldAsk: z.boolean().optional(),
    requiredQuestionIds: z.array(z.string()).default([]),
  }).default({}),
  assumptions: z.array(z.string()).default([]),
});
export type EvalCaseExpectation = z.infer<typeof evalCaseExpectationSchema>;

export const evalCaseSchema = z.object({
  id: z.string().min(1),
  suite: evalSuiteSchema,
  type: evalCaseTypeSchema,
  input: z.object({
    taskType: manifestTaskTypeSchema.optional(),
    prompt: z.string().min(1),
    manifest: z.unknown().optional(),
    clarificationAnswers: z.record(z.string(), z.string()).default({}),
  }),
  expected: evalCaseExpectationSchema,
  metadata: z.object({
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    notes: z.string().optional(),
  }).default({}),
});
export type EvalCase = z.infer<typeof evalCaseSchema>;

export function resolveManifestTaskType(testCase: EvalCase): ManifestTaskType {
  if (testCase.input.taskType) return testCase.input.taskType;
  switch (testCase.type) {
    case 'create':
    case 'fix':
    case 'update':
      return testCase.type;
    default:
      return testCase.input.manifest ? 'update' : 'create';
  }
}

export interface ScorerResult {
  readonly scorer: string;
  readonly score: number;
  readonly passed: boolean;
  readonly diagnostics: string[];
  readonly evidence?: unknown;
}

export interface EvalCaseExecution {
  readonly pipeline: string;
  readonly profile: string;
  readonly caseId: string;
  readonly suite: EvalSuite;
  readonly type: EvalCaseType;
  readonly status: 'completed' | 'needs_clarification' | 'failed' | 'skipped';
  readonly scorers: ScorerResult[];
  readonly rawResult: unknown;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly skipReason?: string;
}

export interface EvalAggregateRow {
  readonly key: string;
  readonly totalCases: number;
  readonly passedCases: number;
  readonly averageScore: number;
}
