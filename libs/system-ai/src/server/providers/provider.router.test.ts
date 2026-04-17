import { describe, expect, it } from 'vitest';
import { ProviderRouter } from './provider.router';
import { buildAiRuntimeConfigFromEnv } from '../runtime-config';

describe('ProviderRouter chain resolution', () => {
  it('routes each step to the provider implied by the model id', () => {
    const config = buildAiRuntimeConfigFromEnv({
      AI_PROVIDER_ORDER: 'anthropic,openrouter',
      AI_OPENROUTER_API_KEYS: 'or-key',
      AI_ANTHROPIC_API_KEY: 'ant-key',
      AI_MODEL_MANIFEST_GENERATE: 'claude-haiku-4-5;nvidia/nemotron-3-super-120b-a12b:free;google/gemma-4-31b-it:free',
      FEATURE_AI_ENABLED: 'true',
    });

    const router = new ProviderRouter(config);
    const chain = router.resolveChainForTask('manifest.create');

    expect(chain.map((step) => step.providerName)).toEqual([
      'anthropic',
      'openrouter',
      'openrouter',
    ]);
  });

  it('falls back to first available provider when model id has no recognizable prefix', () => {
    const config = buildAiRuntimeConfigFromEnv({
      AI_PROVIDER_ORDER: 'openrouter',
      AI_OPENROUTER_API_KEYS: 'or-key',
      AI_MODEL_MANIFEST_GENERATE: 'some-house-brand-model',
      FEATURE_AI_ENABLED: 'true',
    });

    const router = new ProviderRouter(config);
    const chain = router.resolveChainForTask('manifest.create');

    expect(chain[0]?.providerName).toBe('openrouter');
  });

  it('honors an explicit provider pin in the route step', () => {
    const config = buildAiRuntimeConfigFromEnv({
      AI_PROVIDER_ORDER: 'openrouter,anthropic',
      AI_OPENROUTER_API_KEYS: 'or-key',
      AI_ANTHROPIC_API_KEY: 'ant-key',
      AI_TASK_ROUTE_MANIFEST_CREATE: 'anthropic:claude-haiku-4-5|openrouter:google/gemma-4-31b-it:free',
      FEATURE_AI_ENABLED: 'true',
    });

    const router = new ProviderRouter(config);
    const chain = router.resolveChainForTask('manifest.create');

    expect(chain.map((step) => `${step.providerName}/${step.model}`)).toEqual([
      'anthropic/claude-haiku-4-5',
      'openrouter/google/gemma-4-31b-it:free',
    ]);
  });
});
