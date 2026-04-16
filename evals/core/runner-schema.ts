import { z } from 'zod';
import { clarificationModeSchema } from '@ikary/cell-ai';
import { evalCaseTypeSchema, evalSuiteSchema } from './case-schema';

export const evalRunnerOptionsSchema = z.object({
  casesDir: z.string().min(1),
  reportsDir: z.string().min(1),
  profile: z.string().min(1).default(process.env.AI_PROFILE ?? 'fixture'),
  pipelines: z.array(z.string()).default([]),
  suites: z.array(evalSuiteSchema).default([]),
  types: z.array(evalCaseTypeSchema).default([]),
  tags: z.array(z.string()).default([]),
  caseIds: z.array(z.string()).default([]),
  clarificationMode: clarificationModeSchema.default('disabled'),
  runtimeMode: z.enum(['compile-only', 'preview']).default('compile-only'),
  outputJsonFile: z.string().default('eval-report.json'),
  outputMarkdownFile: z.string().default('eval-report.md'),
});

export type EvalRunnerOptions = z.infer<typeof evalRunnerOptionsSchema>;
