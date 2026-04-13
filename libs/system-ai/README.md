# @ikary/system-ai

## Export Surface

- Package root: browser-safe Zod schemas + types for AI providers, config, budgets, usage.
- `./server`: NestJS module, provider adapters, sanitization, budget services. Node-only.

## Purpose

Provider-agnostic LLM access layer for Ikary. Wraps provider SDKs (OpenRouter, OpenAI, Anthropic) behind one interface. Ships a sanitization stack (prompt-injection, PII, input-size) and budget primitives so callers cannot accidentally leak sensitive input or exceed cost caps.

Consumers (try.ikary.co, ikary.co) supply their own config at boot time — the lib never reads `process.env` directly.

## Installation

```sh
pnpm add @ikary/system-ai
```

## Configuration

Provide a validated config object to the NestJS module:

```ts
SystemAiModule.forRoot({
  providerOrder: ['openrouter'],
  providers: {
    openrouter: { apiKeys: ['sk-or-...'] }
  },
  modelByTask: {
    'manifest.generate': 'anthropic/claude-sonnet-4-5'
  }
});
```

## Usage in NestJS

```ts
import { Module } from '@nestjs/common';
import { SystemAiModule } from '@ikary/system-ai/server';

@Module({
  imports: [SystemAiModule.forRoot(runtimeConfig)]
})
export class AppModule {}
```

Inject `ProviderRouter` to resolve a provider instance by task name, then call `streamChat(...)`.

## Security / Isolation Notes

- Sanitization runs on every call by default; input-size, PII redaction, and injection patterns are non-optional.
- API keys are passed into the module at construction and are never logged.

## Versioning

Shares the repo-wide fixed version defined in `.changeset/config.json`.
