# @ikary/system-prompt

## Export Surface

- Package root: browser-safe Zod schemas, error codes, and the in-memory `PromptRegistry` core.
- `./server`: NestJS `PromptRegistryModule` + `PromptRegistryService` that loads `.prompt.md` files from disk at boot.

## Purpose

Centralizes every LLM prompt used across IKARY surfaces into Markdown files with YAML frontmatter (`*.prompt.md`). A non-AI engineer can browse `/prompts/` at the repo root, read the metadata, and edit a prompt without touching TypeScript.

The registry is the single chokepoint where user-provided arguments hit a prompt. Every string argument declared with `source: user` runs through `InputSizeGuard` and `PromptSanitizer` from `@ikary/system-ai/server` at render time, so injection prevention cannot be forgotten by callers.

## Authoring a prompt

Create a file ending in `.prompt.md` under the configured prompts directory (the repo's `/prompts/<consumer-lib>/` by convention):

```markdown
---
name: cell-ai/manifest
description: System prompt for generating a fresh CellManifestV1.
usage: Used by SystemAiManifestTaskExecutor and ManifestGeneratorService as the system message.
version: 1.0.0
arguments:
  - name: user_role
    description: Optional caller role label.
    type: string
    source: user
    required: false
---

You generate Ikary Cell manifests.

{{#if user_role}}Caller role: {{{user_role}}}.{{/if}}
```

Body uses Handlebars. Use triple-stash `{{{var}}}` to avoid HTML escaping (LLM prompts want raw output). The only registered helper is `eq` (equality test inside `{{#if}}`).

### Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Registry key. Format `<scope>/<id>`, lowercase + dashes. |
| `description` | yes | Human-readable purpose. |
| `usage` | yes | Where in the system this prompt is invoked. |
| `version` | yes | Semver. Informational. |
| `arguments` | no | Array of `{ name, description, type, required, source, maxBytes? }`. |

### Argument fields

| Field | Default | Notes |
|---|---|---|
| `type` | `string` | `string` \| `number` \| `boolean` \| `json`. |
| `required` | `true` | Missing required arg throws `PROMPT_ARG_MISSING`. |
| `source` | `system` | Set to `user` to mark untrusted input — registry will sanitize and size-guard it. |
| `maxBytes` | 8000 | Used only when `source: user`. |

## Installation

```sh
pnpm add @ikary/system-prompt
```

## Usage in NestJS

```ts
import { Module } from '@nestjs/common';
import { SystemAiModule } from '@ikary/system-ai/server';
import { PromptRegistryModule } from '@ikary/system-prompt/server';

@Module({
  imports: [
    SystemAiModule.forRoot(aiConfig),
    PromptRegistryModule.forRoot({ promptsDir: '/abs/path/to/prompts' }),
  ],
})
export class AppModule {}
```

`SystemAiModule.forRoot(...)` must come first so the global `PromptSanitizer` and `InputSizeGuard` are available when `PromptRegistryService.onModuleInit` fires.

Render a prompt from any service:

```ts
constructor(private readonly prompts: PromptRegistryService) {}

const systemPrompt = this.prompts.render(
  'cell-ai/manifest',
  { user_role: untrustedInput },
  { correlationId, taskName: 'cell-ai/manifest' },
);
```

## Browser usage (Vite)

The package root exports a framework-free `PromptRegistry` class that takes a pre-loaded record. Bundle prompts at build time with `import.meta.glob`:

```ts
import { PromptRegistry } from '@ikary/system-prompt';

const files = import.meta.glob('/prompts/cell-playground/*.prompt.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const registry = new PromptRegistry(files);
```

The browser registry skips sanitization (no NestJS, no `system-ai` server deps). Use it only for trusted developer surfaces (the legacy playground), never for end-user input.

## Errors

| Code | When |
|---|---|
| `PROMPT_NOT_FOUND` | `get()` / `render()` called with an unknown name. |
| `PROMPT_METADATA_INVALID` | Frontmatter does not satisfy the Zod schema (raised at boot). |
| `PROMPT_ARG_MISSING` | Required argument absent from the render call. |
| `PROMPT_RENDER_FAILED` | Handlebars compile or render threw. |

Plus the upstream `PROMPT_INJECTION_DETECTED` and `INPUT_TOO_LARGE` from `@ikary/system-ai`, propagated unchanged when a `source: user` string trips them.

## Versioning

Shares the repo-wide fixed version defined in `.changeset/config.json`.
