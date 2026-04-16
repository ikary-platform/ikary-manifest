# /prompts

Every LLM prompt used by IKARY lives here as a `*.prompt.md` file with YAML frontmatter. One subfolder per consumer (`cell-ai/`, `cell-playground/`, `evals/`).

This is the only place to edit a prompt. No prompt strings remain in TypeScript source.

## File format

Each file has a YAML frontmatter block followed by the prompt body. The body is a Handlebars template.

```markdown
---
name: cell-ai/manifest-generation
description: System prompt for generating a fresh CellManifestV1 from a user idea.
usage: Used by ManifestGeneratorService.streamManifest as the system message.
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

## Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Registry key. Format `<scope>/<id>`, lowercase letters, digits, dashes. |
| `description` | yes | One-line purpose. |
| `usage` | yes | Where in the system this prompt is invoked. |
| `version` | yes | Semver. Informational. |
| `arguments` | no | Array of argument definitions. Defaults to `[]`. |

Each argument:

| Field | Default | Notes |
|---|---|---|
| `name` | required | Snake_case. |
| `description` | required | What the value represents. |
| `type` | `string` | One of `string`, `number`, `boolean`, `json`. |
| `required` | `true` | If `true`, missing values throw `PROMPT_ARG_MISSING`. |
| `source` | `system` | Set to `user` to mark untrusted input. The registry sanitizes and size-guards `source: user` strings before interpolation. |
| `maxBytes` | `8000` | Used only when `source: user`. |

## How prompts get loaded

`PromptRegistryService.onModuleInit()` recursively scans the directory at boot, parses every `*.prompt.md` file, validates the frontmatter against the Zod schema, pre-compiles the Handlebars template, and caches the result. Boot fails fast on invalid frontmatter or duplicate prompt names.

Render flow per call:

1. Look up the prompt by `name`.
2. Validate that all required arguments are present and well-typed.
3. For arguments declared `source: user`, run `InputSizeGuard.enforce` then `PromptSanitizer.sanitize` from `@ikary/system-ai`. Both throw `UnprocessableEntityException` on violation.
4. Render the Handlebars template with the (possibly sanitized) arguments.

## Adding a new prompt

1. Create a `*.prompt.md` file under the relevant subfolder. Pick a `name` of the form `<scope>/<id>`.
2. Run the consuming app or `pnpm --filter @ikary/system-prompt test`. The boot loader rejects missing or invalid frontmatter with a clear error.
3. Call it from the consumer:

```ts
const text = promptRegistryService.render(
  'cell-ai/my-prompt',
  { my_arg: 'value' },
  { correlationId, taskName: 'cell-ai/my-prompt' },
);
```

## Templating

Handlebars with `strict: true` and `noEscape: true`. Variables that may contain HTML-like content still render raw. The only registered helper is `eq`:

```handlebars
{{#if (eq task_type "create")}}CREATE rules{{/if}}
```

Use `{{{var}}}` (triple-stash) for body interpolation. The double-stash and triple-stash forms are equivalent here because escaping is off, but triple-stash documents the intent.

## Browser usage

The legacy playground (`apps/cell-playground-legacy`) runs in the browser and cannot read the filesystem at runtime. It uses Vite's `import.meta.glob('/prompts/cell-playground/*.prompt.md', { query: '?raw', eager: true })` to bundle the prompt files at build time, then constructs a `PromptRegistry` from the resulting record. Sanitization is skipped on the browser side (the playground is a developer surface, not a public-input one).

## Per-namespace docs

- [cell-ai/](./cell-ai/README.md) - manifest generation and pipeline task prompts.
- [cell-playground/](./cell-playground/README.md) - phase-based legacy studio prompts.
- [evals/](./evals/README.md) - eval harness prompts.

## Implementation

The registry lives in [`libs/system-prompt`](../libs/system-prompt/README.md).
