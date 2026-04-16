import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AiProvider } from '../../shared/provider.interface';
import {
  normalizeTaskRoute,
  resolveActiveProfile,
  type AiRuntimeConfig,
  type ProviderName,
} from '../../shared/config.schema';
import { AI_ERROR_CODES } from '../../shared/error-codes';
import { AnthropicProvider } from './anthropic.provider';
import { OpenAiProvider } from './openai.provider';
import { OpenRouterProvider } from './openrouter.provider';

export interface ResolvedProvider {
  provider: AiProvider;
  providerName: string;
  model: string;
  profile: string;
}

@Injectable()
export class ProviderRouter {
  private readonly instances: Map<string, AiProvider> = new Map();

  constructor(private readonly config: AiRuntimeConfig) {
    this.bootstrapInstances();
  }

  /** Back-compat: returns only the first attempt in the resolved chain. */
  resolveForTask(taskName: string): ResolvedProvider {
    const chain = this.resolveChainForTask(taskName);
    return chain[0]!;
  }

  /**
   * Resolve the full ordered attempt chain for a task. Each attempt is a
   * `{provider, model}` pair; callers iterate and move to the next attempt
   * when a provider call fails or produces unusable output.
   *
   * For now every model in the chain is served by the first available
   * configured provider (OpenRouter fronts all free/paid models under one API).
   * When direct Anthropic/OpenAI adapters land, this function should match
   * model name prefix to provider name.
   */
  resolveChainForTask(taskName: string): ResolvedProvider[] {
    if (!this.config.featureAiEnabled) {
      throw new ServiceUnavailableException({
        code: AI_ERROR_CODES.FEATURE_DISABLED,
        message: 'AI feature disabled by operator.',
      });
    }
    const activeProfile = resolveActiveProfile(this.config);
    const routeValue =
      activeProfile.profile.taskRoutes[taskName]
      ?? this.config.taskRoutes[taskName]
      ?? this.config.modelByTask[taskName];
    const steps = normalizeTaskRoute(routeValue);
    if (steps.length === 0) {
      throw new ServiceUnavailableException({
        code: AI_ERROR_CODES.NO_PROVIDER_AVAILABLE,
        message: `No model configured for task "${taskName}".`,
      });
    }
    const resolved = steps
      .map((step) => {
        const providerName = step.provider ?? findFirstAvailableProvider(activeProfile.profile.providerOrder, this.instances);
        if (!providerName) return null;
        const provider = this.instances.get(providerName);
        if (!provider) return null;
        return {
          provider,
          providerName,
          model: step.model,
          profile: activeProfile.name,
        };
      })
      .filter((value): value is ResolvedProvider => value !== null);

    if (resolved.length === 0) {
      throw new ServiceUnavailableException({
        code: AI_ERROR_CODES.NO_PROVIDER_AVAILABLE,
        message: `No configured provider is available for task "${taskName}".`,
      });
    }

    return resolved;
  }

  private bootstrapInstances(): void {
    for (const name of this.config.providerOrder) {
      const creds = this.config.providers[name];
      if (!creds || creds.apiKeys.length === 0) continue;
      const instance = this.buildProvider(name, creds.apiKeys[0]!, creds.baseUrl);
      if (instance) this.instances.set(name, instance);
    }
  }

  private buildProvider(name: ProviderName, apiKey: string, baseUrl?: string): AiProvider | null {
    switch (name) {
      case 'openrouter':
        return new OpenRouterProvider(apiKey, baseUrl);
      case 'anthropic':
        return new AnthropicProvider(apiKey, baseUrl);
      case 'openai':
        return new OpenAiProvider(apiKey, baseUrl);
    }
  }
}

function findFirstAvailableProvider(
  providerOrder: string[],
  instances: Map<string, AiProvider>,
): string | null {
  for (const name of providerOrder) {
    if (instances.has(name)) return name;
  }
  return null;
}
