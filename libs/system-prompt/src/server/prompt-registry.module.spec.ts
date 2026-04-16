import { describe, expect, it } from 'vitest';
import { PromptRegistryModule } from './prompt-registry.module';
import {
  PromptRegistryService,
  PROMPT_REGISTRY_OPTIONS,
} from './prompt-registry.service';

describe('PromptRegistryModule.forRoot', () => {
  it('returns a global DynamicModule exporting the service', () => {
    const mod = PromptRegistryModule.forRoot({ promptsDir: '/abs/prompts' });
    expect(mod.module).toBe(PromptRegistryModule);
    expect(mod.global).toBe(true);
    expect(mod.exports).toEqual([PromptRegistryService]);

    const providers = mod.providers ?? [];
    const optionsProvider = providers.find(
      (p): p is { provide: symbol; useValue: { promptsDir: string } } =>
        typeof p === 'object' && 'provide' in p && p.provide === PROMPT_REGISTRY_OPTIONS,
    );
    expect(optionsProvider?.useValue).toEqual({ promptsDir: '/abs/prompts' });
    expect(providers).toContain(PromptRegistryService);
  });
});
