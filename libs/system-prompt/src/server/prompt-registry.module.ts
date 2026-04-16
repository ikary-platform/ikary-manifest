import { DynamicModule, Module } from '@nestjs/common';
import {
  PROMPT_REGISTRY_OPTIONS,
  PromptRegistryService,
  type PromptRegistryOptions,
} from './prompt-registry.service';

@Module({})
export class PromptRegistryModule {
  static forRoot(options: PromptRegistryOptions): DynamicModule {
    return {
      module: PromptRegistryModule,
      global: true,
      providers: [
        { provide: PROMPT_REGISTRY_OPTIONS, useValue: options },
        PromptRegistryService,
      ],
      exports: [PromptRegistryService],
    };
  }
}
