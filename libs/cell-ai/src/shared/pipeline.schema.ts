import { z } from 'zod';

export const manifestTaskTypeSchema = z.enum(['create', 'fix', 'update']);
export type ManifestTaskType = z.infer<typeof manifestTaskTypeSchema>;

export const clarificationModeSchema = z.enum(['disabled', 'enabled']);
export type ClarificationMode = z.infer<typeof clarificationModeSchema>;

export const clarifyingQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  reason: z.string().min(1),
  options: z.array(z.string().min(1)).default([]),
});
export type ClarifyingQuestion = z.infer<typeof clarifyingQuestionSchema>;

export const knowledgeItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['blueprint', 'example', 'schema', 'guidance']),
  title: z.string().min(1),
  summary: z.string().min(1),
  source: z.string().min(1),
  score: z.number().min(0).max(1),
  content: z.unknown().optional(),
});
export type KnowledgeItem = z.infer<typeof knowledgeItemSchema>;

export const contextAssemblySchema = z.object({
  summary: z.string().min(1),
  promptContext: z.string().min(1),
  assumptions: z.array(z.string()).default([]),
  items: z.array(knowledgeItemSchema).default([]),
});
export type ContextAssembly = z.infer<typeof contextAssemblySchema>;

export const validationStageResultSchema = z.object({
  stage: z.enum(['parse', 'schema', 'semantic', 'compile', 'runtime']),
  passed: z.boolean(),
  errors: z.array(z.string()).default([]),
  evidence: z.unknown().optional(),
});
export type ValidationStageResult = z.infer<typeof validationStageResultSchema>;

export const executionTraceSchema = z.object({
  taskType: manifestTaskTypeSchema,
  retrievalHits: z.array(knowledgeItemSchema).default([]),
  contextSummary: z.string().default(''),
  assembledContext: z.string().default(''),
  policyDecisions: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  provider: z.string().optional(),
  model: z.string().optional(),
  timingMs: z.number().int().nonnegative().default(0),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  validation: z.array(validationStageResultSchema).default([]),
  candidateManifest: z.unknown().optional(),
  compiledManifest: z.unknown().optional(),
  runtime: z.unknown().optional(),
  diagnostics: z.array(z.string()).default([]),
});
export type ExecutionTrace = z.infer<typeof executionTraceSchema>;

export const manifestTaskInputSchema = z.object({
  type: manifestTaskTypeSchema,
  prompt: z.string().min(1),
  manifest: z.unknown().optional(),
  clarificationMode: clarificationModeSchema.default('disabled'),
  clarificationAnswers: z.record(z.string(), z.string()).default({}),
  metadata: z.record(z.unknown()).default({}),
});
export type ManifestTaskInput = z.infer<typeof manifestTaskInputSchema>;

export type EvalExecutionResult =
  | {
      status: 'completed';
      manifest: unknown;
      assumptions: string[];
      trace: ExecutionTrace;
    }
  | {
      status: 'needs_clarification';
      questions: ClarifyingQuestion[];
      assumptions: string[];
      trace: ExecutionTrace;
    }
  | {
      status: 'failed';
      error: string;
      assumptions: string[];
      trace: ExecutionTrace;
    };
