import { describe, expect, it } from 'vitest';
import { buildAiRuntimeConfig, buildAiRuntimeConfigFromEnv, redactAiRuntimeConfig } from './runtime-config';

describe('buildAiRuntimeConfigFromEnv', () => {
  it('builds provider routing and profiles from env vars', () => {
    const config = buildAiRuntimeConfigFromEnv({
      AI_PROFILE: 'bench',
      AI_PROVIDER_ORDER: 'openrouter,anthropic',
      AI_OPENROUTER_API_KEYS: 'or-key',
      AI_ANTHROPIC_API_KEY: 'ant-key',
      AI_TASK_ROUTE_MANIFEST_CREATE: 'openrouter:qwen/qwen3|anthropic:claude-sonnet-4-5',
      AI_MODEL_MANIFEST_CLARIFY: 'openai/gpt-4.1-mini',
      AI_MODEL_CHAT_CONVERSE: 'anthropic/claude-haiku-4-5',
      FEATURE_AI_ENABLED: 'true',
    });

    expect(config.activeProfile).toBe('bench');
    expect(config.profiles.bench.providerOrder).toEqual(['openrouter', 'anthropic']);
    expect(config.taskRoutes['manifest.create']).toEqual([
      { provider: 'openrouter', model: 'qwen/qwen3' },
      { provider: 'anthropic', model: 'claude-sonnet-4-5' },
    ]);
  });

  it('redacts provider keys in config logs', () => {
    const config = buildAiRuntimeConfigFromEnv({
      AI_PROVIDER_ORDER: 'openrouter',
      AI_OPENROUTER_API_KEYS: 'super-secret-key',
      FEATURE_AI_ENABLED: 'true',
    });

    const redacted = redactAiRuntimeConfig(config);
    const provider = (redacted.providers as Record<string, { apiKeys: string[] }>).openrouter;
    expect(provider.apiKeys[0]).not.toContain('super-secret-key');
  });

  it('parses semicolon-separated model fallback chain and inherits fix/update from generate', () => {
    const config = buildAiRuntimeConfigFromEnv({
      AI_PROVIDER_ORDER: 'openrouter',
      AI_OPENROUTER_API_KEYS: 'or-key',
      AI_MODEL_MANIFEST_GENERATE: 'a:free;b:free;c-paid',
      FEATURE_AI_ENABLED: 'true',
    });

    expect(config.taskRoutes['manifest.create']).toEqual([
      { model: 'a:free' },
      { model: 'b:free' },
      { model: 'c-paid' },
    ]);
    expect(config.taskRoutes['manifest.fix']).toEqual(config.taskRoutes['manifest.create']);
    expect(config.taskRoutes['manifest.update']).toEqual(config.taskRoutes['manifest.create']);
  });

  it('builds config from parsed env values', () => {
    const config = buildAiRuntimeConfig({
      AI_PROFILE: 'parsed',
      AI_PROVIDER_ORDER: 'openrouter',
      AI_OPENROUTER_API_KEYS: 'or-key',
      AI_MODEL_MANIFEST_GENERATE: 'openai/gpt-oss-120b:free',
      AI_MODEL_MANIFEST_CLARIFY: 'openai/gpt-4.1-mini',
      AI_MODEL_CHAT_CONVERSE: 'anthropic/claude-haiku-4-5',
      AI_BUDGET_PER_TURN_INPUT_TOKENS: 2000,
      AI_BUDGET_PER_TURN_OUTPUT_TOKENS: 2000,
      AI_BUDGET_PER_SESSION_TOKENS: 40000,
      AI_BUDGET_PER_SESSION_MESSAGES: 6,
      AI_BUDGET_GLOBAL_DAILY_USD: 20,
      FEATURE_AI_ENABLED: true,
    });

    expect(config.activeProfile).toBe('parsed');
    expect(config.featureAiEnabled).toBe(true);
  });
});
