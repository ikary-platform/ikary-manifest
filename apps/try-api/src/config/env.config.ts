import { z } from 'zod';
import {
  aiRuntimeConfigSchema,
  budgetEnvelopeSchema,
  type AiRuntimeConfig,
  type ProviderCreds,
} from '@ikary/system-ai';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4510),
  NODE_ENV: z.string().default('development'),

  // AI providers
  AI_PROVIDER_ORDER: z.string().default('openrouter'),
  AI_OPENROUTER_API_KEYS: z.string().optional(),
  AI_OPENROUTER_DAILY_CAP_USD: z.coerce.number().positive().optional(),
  AI_ANTHROPIC_API_KEY: z.string().optional(),
  AI_OPENAI_API_KEY: z.string().optional(),

  // Task → model mapping.
  // Each value accepts a comma-separated fallback chain; the router will try
  // each model in order when the current one fails (provider error, invalid
  // output). The default chain leans on free OpenRouter models first so the
  // demo proves that declarative generation is cheap, and only falls back to
  // paid Claude Sonnet if all free options misfire.
  AI_MODEL_MANIFEST_GENERATE: z
    .string()
    .default(
      'openai/gpt-oss-120b:free,qwen/qwen3-next-80b-a3b-instruct:free,google/gemma-4-31b-it:free,anthropic/claude-sonnet-4-5',
    ),
  AI_MODEL_MANIFEST_CLARIFY: z.string().default('openai/gpt-4.1-mini'),
  AI_MODEL_CHAT_CONVERSE: z.string().default('anthropic/claude-haiku-4-5'),

  // Budgets
  AI_BUDGET_PER_TURN_INPUT_TOKENS: z.coerce.number().int().positive().default(2000),
  AI_BUDGET_PER_TURN_OUTPUT_TOKENS: z.coerce.number().int().positive().default(2000),
  AI_BUDGET_PER_SESSION_TOKENS: z.coerce.number().int().positive().default(40000),
  AI_BUDGET_PER_SESSION_MESSAGES: z.coerce.number().int().positive().default(6),
  AI_BUDGET_GLOBAL_DAILY_USD: z.coerce.number().positive().default(20),

  FEATURE_AI_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  // Paths
  EXAMPLES_DIR: z.string().optional(),
});

export type ParsedEnv = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): ParsedEnv {
  return envSchema.parse(source);
}

/**
 * Split a comma-separated model-chain env value into an array. Trims, drops
 * empties. If only one non-empty entry, returns a plain string so the schema
 * stays backwards-compatible with single-model deployments.
 */
function parseModelChain(value: string): string | string[] {
  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return value;
  if (parts.length === 1) return parts[0]!;
  return parts;
}

export function buildAiRuntimeConfig(env: ParsedEnv): AiRuntimeConfig {
  const providerOrder = env.AI_PROVIDER_ORDER.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const providers: Partial<Record<'openrouter' | 'anthropic' | 'openai', ProviderCreds>> = {};
  if (env.AI_OPENROUTER_API_KEYS) {
    const keys = env.AI_OPENROUTER_API_KEYS.split(',').map((s) => s.trim()).filter(Boolean);
    if (keys.length > 0) {
      providers.openrouter = {
        apiKeys: keys,
        ...(env.AI_OPENROUTER_DAILY_CAP_USD !== undefined
          ? { dailyCapUsd: env.AI_OPENROUTER_DAILY_CAP_USD }
          : {}),
      };
    }
  }
  if (env.AI_ANTHROPIC_API_KEY) {
    providers.anthropic = { apiKeys: [env.AI_ANTHROPIC_API_KEY] };
  }
  if (env.AI_OPENAI_API_KEY) {
    providers.openai = { apiKeys: [env.AI_OPENAI_API_KEY] };
  }

  return aiRuntimeConfigSchema.parse({
    providerOrder,
    providers,
    modelByTask: {
      'manifest.generate': parseModelChain(env.AI_MODEL_MANIFEST_GENERATE),
      'manifest.clarify': parseModelChain(env.AI_MODEL_MANIFEST_CLARIFY),
      'chat.converse': parseModelChain(env.AI_MODEL_CHAT_CONVERSE),
    },
    budgets: budgetEnvelopeSchema.parse({
      perTurnInputTokens: env.AI_BUDGET_PER_TURN_INPUT_TOKENS,
      perTurnOutputTokens: env.AI_BUDGET_PER_TURN_OUTPUT_TOKENS,
      perSessionTokens: env.AI_BUDGET_PER_SESSION_TOKENS,
      perSessionMessages: env.AI_BUDGET_PER_SESSION_MESSAGES,
      globalDailyUsd: env.AI_BUDGET_GLOBAL_DAILY_USD,
    }),
    featureAiEnabled: env.FEATURE_AI_ENABLED,
  });
}

export function logResolvedConfig(env: ParsedEnv, config: AiRuntimeConfig): void {
  const redact = (k: string) => (k.length > 6 ? `${k.slice(0, 4)}…${k.slice(-2)}` : '***');
  const redactedProviders = Object.fromEntries(
    Object.entries(config.providers).map(([name, creds]) => [
      name,
      {
        keys: creds.apiKeys.map(redact),
        dailyCapUsd: creds.dailyCapUsd,
      },
    ]),
  );
  // eslint-disable-next-line no-console
  console.log('[try-api] resolved config', {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    providerOrder: config.providerOrder,
    providers: redactedProviders,
    modelByTask: config.modelByTask,
    budgets: config.budgets,
    featureAiEnabled: config.featureAiEnabled,
  });
}
