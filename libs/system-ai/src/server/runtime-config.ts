import { z } from 'zod';
import {
  aiRuntimeConfigSchema,
  budgetEnvelopeSchema,
  providerNameSchema,
  type AiRuntimeConfig,
  type AiTaskRouteStep,
  type ProviderCreds,
  type ProviderName,
} from '../shared/config.schema';

export const AI_TASK_ROUTE_ENV_MAP = {
  AI_TASK_ROUTE_MANIFEST_CREATE: 'manifest.create',
  AI_TASK_ROUTE_MANIFEST_FIX: 'manifest.fix',
  AI_TASK_ROUTE_MANIFEST_UPDATE: 'manifest.update',
  AI_TASK_ROUTE_MANIFEST_CLARIFY: 'manifest.clarify',
  AI_TASK_ROUTE_CHAT_CONVERSE: 'chat.converse',
} as const;

export const aiRuntimeEnvSchema = z.object({
  AI_PROFILE: z.string().default('default'),
  AI_PROVIDER_ORDER: z.string().default('openrouter'),
  AI_OPENROUTER_API_KEYS: z.string().optional(),
  AI_OPENROUTER_BASE_URL: z.string().url().optional(),
  AI_OPENROUTER_DAILY_CAP_USD: z.coerce.number().positive().optional(),
  AI_ANTHROPIC_API_KEY: z.string().optional(),
  AI_ANTHROPIC_BASE_URL: z.string().url().optional(),
  AI_OPENAI_API_KEY: z.string().optional(),
  AI_OPENAI_BASE_URL: z.string().url().optional(),
  AI_MODEL_MANIFEST_GENERATE: z
    .string()
    .default(
      'claude-haiku-4-5;claude-sonnet-4-6;nvidia/nemotron-3-super-120b-a12b:free;google/gemma-4-31b-it:free',
    ),
  AI_MODEL_MANIFEST_FIX: z.string().optional(),
  AI_MODEL_MANIFEST_UPDATE: z.string().optional(),
  AI_MODEL_MANIFEST_CLARIFY: z.string().default('openai/gpt-4.1-mini'),
  AI_MODEL_CHAT_CONVERSE: z.string().default('anthropic/claude-haiku-4-5'),
  AI_TASK_ROUTE_MANIFEST_CREATE: z.string().optional(),
  AI_TASK_ROUTE_MANIFEST_FIX: z.string().optional(),
  AI_TASK_ROUTE_MANIFEST_UPDATE: z.string().optional(),
  AI_TASK_ROUTE_MANIFEST_CLARIFY: z.string().optional(),
  AI_TASK_ROUTE_CHAT_CONVERSE: z.string().optional(),
  AI_BUDGET_PER_TURN_INPUT_TOKENS: z.coerce.number().int().positive().default(2000),
  AI_BUDGET_PER_TURN_OUTPUT_TOKENS: z.coerce.number().int().positive().default(6000),
  AI_BUDGET_PER_SESSION_TOKENS: z.coerce.number().int().positive().default(40000),
  AI_BUDGET_PER_SESSION_MESSAGES: z.coerce.number().int().positive().default(6),
  AI_BUDGET_GLOBAL_DAILY_USD: z.coerce.number().positive().default(20),
  AI_PROMPT_CACHE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  AI_RATE_LIMIT_RETRY_AFTER_MAX_MS: z.coerce.number().int().nonnegative().default(30_000),
  AI_RATE_LIMIT_MAX_RETRIES_SAME_MODEL: z.coerce.number().int().nonnegative().default(2),
  AI_RATE_LIMIT_BACKOFF_BASE_MS: z.coerce.number().int().nonnegative().default(500),
  FEATURE_AI_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

export type AiRuntimeEnv = z.infer<typeof aiRuntimeEnvSchema>;

export function parseAiRuntimeEnv(source: NodeJS.ProcessEnv = process.env): AiRuntimeEnv {
  return aiRuntimeEnvSchema.parse(source);
}

export function buildAiRuntimeConfigFromEnv(source: NodeJS.ProcessEnv = process.env): AiRuntimeConfig {
  return buildAiRuntimeConfig(parseAiRuntimeEnv(source));
}

export function buildAiRuntimeConfig(env: AiRuntimeEnv): AiRuntimeConfig {
  const providerOrder = parseProviderOrder(env.AI_PROVIDER_ORDER);
  const taskRoutes = buildTaskRoutes(env);

  return aiRuntimeConfigSchema.parse({
    providerOrder,
    providers: buildProviders(env),
    modelByTask: buildLegacyModelByTask(env),
    taskRoutes,
    activeProfile: env.AI_PROFILE,
    profiles: {
      [env.AI_PROFILE]: {
        providerOrder,
        taskRoutes,
      },
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

export function redactAiRuntimeConfig(config: AiRuntimeConfig): Record<string, unknown> {
  return {
    activeProfile: config.activeProfile,
    providerOrder: config.providerOrder,
    profiles: Object.fromEntries(
      Object.entries(config.profiles).map(([profileName, profile]) => [
        profileName,
        {
          providerOrder: profile.providerOrder,
          taskRoutes: profile.taskRoutes,
        },
      ]),
    ),
    providers: Object.fromEntries(
      Object.entries(config.providers).map(([name, creds]) => [
        name,
        {
          baseUrl: creds.baseUrl,
          dailyCapUsd: creds.dailyCapUsd,
          apiKeys: creds.apiKeys.map((key) => redactKey(key)),
        },
      ]),
    ),
    modelByTask: config.modelByTask,
    taskRoutes: config.taskRoutes,
    budgets: config.budgets,
    featureAiEnabled: config.featureAiEnabled,
  };
}

function parseProviderOrder(value: string): ProviderName[] {
  const entries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.length > 0
    ? z.array(providerNameSchema).min(1).parse(entries)
    : ['openrouter'];
}

function buildProviders(env: AiRuntimeEnv): Record<ProviderName, ProviderCreds> {
  const providers: Partial<Record<ProviderName, ProviderCreds>> = {};

  if (env.AI_OPENROUTER_API_KEYS) {
    const keys = env.AI_OPENROUTER_API_KEYS
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (keys.length > 0) {
      providers.openrouter = {
        apiKeys: keys,
        ...(env.AI_OPENROUTER_BASE_URL ? { baseUrl: env.AI_OPENROUTER_BASE_URL } : {}),
        ...(env.AI_OPENROUTER_DAILY_CAP_USD !== undefined ? { dailyCapUsd: env.AI_OPENROUTER_DAILY_CAP_USD } : {}),
      };
    }
  }

  if (env.AI_ANTHROPIC_API_KEY) {
    providers.anthropic = {
      apiKeys: [env.AI_ANTHROPIC_API_KEY],
      ...(env.AI_ANTHROPIC_BASE_URL ? { baseUrl: env.AI_ANTHROPIC_BASE_URL } : {}),
    };
  }

  if (env.AI_OPENAI_API_KEY) {
    providers.openai = {
      apiKeys: [env.AI_OPENAI_API_KEY],
      ...(env.AI_OPENAI_BASE_URL ? { baseUrl: env.AI_OPENAI_BASE_URL } : {}),
    };
  }

  return providers as Record<ProviderName, ProviderCreds>;
}

function buildLegacyModelByTask(env: AiRuntimeEnv): Record<string, string | string[]> {
  const generate = parseModelChain(env.AI_MODEL_MANIFEST_GENERATE);
  return {
    'manifest.generate': generate,
    'manifest.create': generate,
    'manifest.fix': env.AI_MODEL_MANIFEST_FIX ? parseModelChain(env.AI_MODEL_MANIFEST_FIX) : generate,
    'manifest.update': env.AI_MODEL_MANIFEST_UPDATE ? parseModelChain(env.AI_MODEL_MANIFEST_UPDATE) : generate,
    'manifest.clarify': parseModelChain(env.AI_MODEL_MANIFEST_CLARIFY),
    'chat.converse': parseModelChain(env.AI_MODEL_CHAT_CONVERSE),
  };
}

function buildTaskRoutes(env: AiRuntimeEnv): Record<string, AiTaskRouteStep[]> {
  const generateRoute = normalizeLegacyTaskRoute(parseModelChain(env.AI_MODEL_MANIFEST_GENERATE));
  const routes: Record<string, AiTaskRouteStep[]> = {
    'manifest.create': generateRoute,
    'manifest.generate': generateRoute,
    'manifest.fix': env.AI_MODEL_MANIFEST_FIX
      ? normalizeLegacyTaskRoute(parseModelChain(env.AI_MODEL_MANIFEST_FIX))
      : generateRoute,
    'manifest.update': env.AI_MODEL_MANIFEST_UPDATE
      ? normalizeLegacyTaskRoute(parseModelChain(env.AI_MODEL_MANIFEST_UPDATE))
      : generateRoute,
    'manifest.clarify': normalizeLegacyTaskRoute(parseModelChain(env.AI_MODEL_MANIFEST_CLARIFY)),
    'chat.converse': normalizeLegacyTaskRoute(parseModelChain(env.AI_MODEL_CHAT_CONVERSE)),
  };

  for (const [envKey, taskId] of Object.entries(AI_TASK_ROUTE_ENV_MAP)) {
    const parsed = parseTaskRoute(env[envKey as keyof AiRuntimeEnv] as string | undefined);
    if (parsed) {
      routes[taskId] = parsed;
    }
  }

  return routes;
}

function parseTaskRoute(value: string | undefined): AiTaskRouteStep[] | undefined {
  if (!value?.trim()) return undefined;

  return value
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf(':');
      if (separatorIndex === -1) {
        return { model: entry };
      }

      const maybeProvider = entry.slice(0, separatorIndex).trim();
      const model = entry.slice(separatorIndex + 1).trim();
      if (!model) {
        return { model: maybeProvider };
      }

      if (providerNameSchema.safeParse(maybeProvider).success) {
        return {
          provider: maybeProvider as ProviderName,
          model,
        };
      }

      return { model: entry };
    });
}

function parseModelChain(value: string): string | string[] {
  const parts = value
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (parts.length === 0) return value;
  if (parts.length === 1) return parts[0]!;
  return parts;
}

function normalizeLegacyTaskRoute(value: string | string[]): AiTaskRouteStep[] {
  return (Array.isArray(value) ? value : [value]).map((model) => ({ model }));
}

function redactKey(value: string): string {
  return value.length > 6 ? `${value.slice(0, 4)}...${value.slice(-2)}` : '***';
}
