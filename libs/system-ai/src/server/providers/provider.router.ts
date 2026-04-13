import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AiProvider } from '../../shared/provider.interface';
import { normalizeModelChain, type AiRuntimeConfig, type ProviderName } from '../../shared/config.schema';
import { AI_ERROR_CODES } from '../../shared/error-codes';
import { OpenRouterProvider } from './openrouter.provider';

export interface ResolvedProvider {
  provider: AiProvider;
  model: string;
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
    const models = normalizeModelChain(this.config.modelByTask[taskName]);
    if (models.length === 0) {
      throw new ServiceUnavailableException({
        code: AI_ERROR_CODES.NO_PROVIDER_AVAILABLE,
        message: `No model configured for task "${taskName}".`,
      });
    }
    let provider: AiProvider | undefined;
    for (const name of this.config.providerOrder) {
      const inst = this.instances.get(name);
      if (inst) {
        provider = inst;
        break;
      }
    }
    if (!provider) {
      throw new ServiceUnavailableException({
        code: AI_ERROR_CODES.NO_PROVIDER_AVAILABLE,
        message: 'No configured provider is available.',
      });
    }
    return models.map((model) => ({ provider: provider!, model }));
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
      case 'openai':
        // Week 2 adapters - not yet wired.
        return null;
    }
  }
}
