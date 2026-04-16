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

export const aiTaskRouteStepSchema = z.object({
  provider: providerNameSchema.optional(),
  model: z.string().min(1),
});
export type AiTaskRouteStep = z.infer<typeof aiTaskRouteStepSchema>;

export const taskRouteValueSchema = z.union([
  taskModelValueSchema,
  z.array(aiTaskRouteStepSchema).min(1),
]);
export type TaskRouteValue = z.infer<typeof taskRouteValueSchema>;

export const aiExecutionProfileSchema = z.object({
  providerOrder: z.array(providerNameSchema).min(1),
  taskRoutes: z.record(z.string(), taskRouteValueSchema).default({}),
});
export type AiExecutionProfile = z.infer<typeof aiExecutionProfileSchema>;

export const aiRuntimeConfigSchema = z.object({
  providerOrder: z.array(providerNameSchema).min(1),
  providers: z.record(providerNameSchema, providerCredsSchema),
  modelByTask: z.record(z.string(), taskModelValueSchema),
  taskRoutes: z.record(z.string(), taskRouteValueSchema).default({}),
  profiles: z.record(z.string(), aiExecutionProfileSchema).default({}),
  activeProfile: z.string().min(1).optional(),
  budgets: budgetEnvelopeSchema.default({}),
  featureAiEnabled: z.boolean().default(true),
});
export type AiRuntimeConfig = z.infer<typeof aiRuntimeConfigSchema>;

export function normalizeModelChain(value: TaskModelValue | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function normalizeTaskRoute(value: TaskRouteValue | undefined): AiTaskRouteStep[] {
  if (!value) return [];
  if (typeof value === 'string') return [{ model: value }];
  if (Array.isArray(value) && value.every((entry) => typeof entry === 'string')) {
    return (value as string[]).map((model) => ({ model }));
  }
  return value as AiTaskRouteStep[];
}

export function resolveActiveProfile(config: AiRuntimeConfig): { name: string; profile: AiExecutionProfile } {
  if (config.activeProfile) {
    const active = config.profiles[config.activeProfile];
    if (active) {
      return {
        name: config.activeProfile,
        profile: active,
      };
    }
  }

  const profileNames = Object.keys(config.profiles);
  if (profileNames.length > 0) {
    const name = profileNames[0]!;
    return {
      name,
      profile: config.profiles[name]!,
    };
  }

  return {
    name: 'default',
    profile: {
      providerOrder: config.providerOrder,
      taskRoutes: {
        ...Object.fromEntries(
          Object.entries(config.modelByTask).map(([taskId, model]) => [taskId, model]),
        ),
        ...config.taskRoutes,
      },
    },
  };
}
