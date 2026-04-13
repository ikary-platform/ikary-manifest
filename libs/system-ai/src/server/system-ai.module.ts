import { DynamicModule, Module } from '@nestjs/common';
import { aiRuntimeConfigSchema, type AiRuntimeConfig } from '../shared/config.schema';
import { ProviderRouter } from './providers/provider.router';
import { PromptSanitizer } from './sanitization/prompt-sanitizer';
import { PiiDetector } from './sanitization/pii-detector';
import { InputSizeGuard } from './sanitization/input-size-guard';

export const SYSTEM_AI_CONFIG = Symbol('SYSTEM_AI_CONFIG');

@Module({})
export class SystemAiModule {
  static forRoot(rawConfig: AiRuntimeConfig): DynamicModule {
    const config = aiRuntimeConfigSchema.parse(rawConfig);
    const configProvider = { provide: SYSTEM_AI_CONFIG, useValue: config };
    const routerProvider = {
      provide: ProviderRouter,
      useFactory: () => new ProviderRouter(config),
    };
    return {
      module: SystemAiModule,
      global: true,
      providers: [configProvider, routerProvider, PromptSanitizer, PiiDetector, InputSizeGuard],
      exports: [ProviderRouter, PromptSanitizer, PiiDetector, InputSizeGuard, SYSTEM_AI_CONFIG],
    };
  }
}
