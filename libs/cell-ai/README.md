# @ikary/cell-ai

## Export Surface

- Package root: Zod schemas for manifest-generation tasks, blueprint metadata.
- `./server`: NestJS module, `ManifestGeneratorService`, `PartialManifestAssembler`, blueprint loader.

## Purpose

Cell-domain intelligence layered on top of `@ikary/system-ai`. Knows how to:
- Turn a free-form user prompt into a valid `CellManifestV1` via streaming LLM output + tolerant progressive assembly.
- Load curated blueprints (YAML under `manifests/examples/`) as a budget-exhausted fallback.

Depends on `@ikary/cell-contract` for `parseManifest`, so it is a `cell-*` lib per repo naming rules.

## Usage in NestJS

```ts
import { CellAiModule } from '@ikary/cell-ai/server';

@Module({ imports: [CellAiModule.register()] })
export class AppModule {}
```

Inject `ManifestGeneratorService` and call `streamManifest(userPrompt)` to receive stable manifest snapshots as the LLM streams.
