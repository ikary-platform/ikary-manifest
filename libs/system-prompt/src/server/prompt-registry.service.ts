import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PromptSanitizer, InputSizeGuard } from '@ikary/system-ai/server';
import {
  PromptRegistry,
  type PromptDefinition,
  type RegistryArgHook,
  type RenderContext,
} from '../shared/registry-core';
import { PROMPT_ERROR_CODES, PromptRegistryError } from '../shared/error-codes';
import { loadPromptFiles } from './prompt-loader';
import { createSanitizationHook } from './sanitization-bridge';

export const PROMPT_REGISTRY_OPTIONS = Symbol('PROMPT_REGISTRY_OPTIONS');

export interface PromptRegistryOptions {
  promptsDir: string;
}

interface RegistryState {
  registry: PromptRegistry;
  argHook: RegistryArgHook;
}

@Injectable()
export class PromptRegistryService implements OnModuleInit {
  private readonly logger = new Logger(PromptRegistryService.name);
  private state: RegistryState | null = null;

  constructor(
    @Inject(PROMPT_REGISTRY_OPTIONS) private readonly options: PromptRegistryOptions,
    @Inject(PromptSanitizer) private readonly sanitizer: PromptSanitizer,
    @Inject(InputSizeGuard) private readonly sizeGuard: InputSizeGuard,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.state) return;
    const files = await loadPromptFiles(this.options.promptsDir);
    const registry = new PromptRegistry(files);
    const argHook = createSanitizationHook(this.sanitizer, this.sizeGuard);
    this.state = { registry, argHook };
    this.logger.log(`Loaded ${registry.list().length} prompts from ${this.options.promptsDir}`);
  }

  list(): PromptDefinition[] {
    return this.ready().registry.list();
  }

  get(name: string): PromptDefinition {
    return this.ready().registry.get(name);
  }

  render(
    name: string,
    args: Record<string, unknown> = {},
    ctx: RenderContext = {},
  ): string {
    const { registry, argHook } = this.ready();
    return registry.render(name, args, ctx, argHook);
  }

  private ready(): RegistryState {
    if (!this.state) {
      throw new PromptRegistryError(
        PROMPT_ERROR_CODES.PROMPT_NOT_FOUND,
        'PromptRegistryService accessed before onModuleInit completed.',
      );
    }
    return this.state;
  }
}
