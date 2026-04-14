import { z } from 'zod';

export const providerNameSchema = z.enum(['openrouter', 'anthropic', 'openai']);
export type ProviderName = z.infer<typeof providerNameSchema>;

export const providerCredsSchema = z.object({
  apiKeys: z.array(z.string().min(1)).min(1),
  dailyCapUsd: z.number().positive().optional(),
  baseUrl: z.string().url().optional(),
});
export type ProviderCreds = z.infer<typeof providerCredsSchema>;

export const budgetEnvelopeSchema = z.object({
  perTurnInputTokens: z.number().int().positive().default(4000),
  perTurnOutputTokens: z.number().int().positive().default(6000),
  perSessionTokens: z.number().int().positive().default(40000),
  perSessionMessages: z.number().int().positive().default(6),
  globalDailyUsd: z.number().positive().default(20),
});
export type BudgetEnvelope = z.infer<typeof budgetEnvelopeSchema>;

/**
 * Per-task model configuration. Accepts either a single model string or an
 * ordered fallback chain - the router will try each in turn on provider
 * errors or invalid-output failures. Example chain:
 *   ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-3.3-70b-instruct:free", "anthropic/claude-sonnet-4-5"]
 */
export const taskModelValueSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
]);
export type TaskModelValue = z.infer<typeof taskModelValueSchema>;

export const aiRuntimeConfigSchema = z.object({
  providerOrder: z.array(providerNameSchema).min(1),
  providers: z.record(providerNameSchema, providerCredsSchema),
  modelByTask: z.record(z.string(), taskModelValueSchema),
  budgets: budgetEnvelopeSchema.default({}),
  featureAiEnabled: z.boolean().default(true),
});
export type AiRuntimeConfig = z.infer<typeof aiRuntimeConfigSchema>;

export function normalizeModelChain(value: TaskModelValue | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
