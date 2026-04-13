import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProviderRouter, PromptSanitizer, InputSizeGuard } from '@ikary/system-ai/server';
import { CELL_AI_TASKS } from '../shared/task-id';
import type { ManifestGenerationInput, ManifestStreamEvent } from '../shared/manifest-generation.schema';
import { MANIFEST_GENERATION_SYSTEM_PROMPT } from './system-prompts';
import { PartialManifestAssembler } from './partial-manifest-assembler';

const MAX_PROMPT_BYTES = 8_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 2000;

@Injectable()
export class ManifestGeneratorService {
  private readonly logger = new Logger(ManifestGeneratorService.name);

  constructor(
    @Inject(ProviderRouter) private readonly router: ProviderRouter,
    @Inject(PromptSanitizer) private readonly sanitizer: PromptSanitizer,
    @Inject(InputSizeGuard) private readonly sizeGuard: InputSizeGuard,
    @Inject(PartialManifestAssembler) private readonly assembler: PartialManifestAssembler,
  ) {}

  async *streamManifest(
    input: ManifestGenerationInput,
    correlationId: string,
    signal?: AbortSignal,
  ): AsyncGenerator<ManifestStreamEvent> {
    const userPrompt = this.prepare(input.userPrompt, correlationId);
    const userMessage = buildUserMessage(input);
    const chain = this.router.resolveChainForTask(CELL_AI_TASKS.MANIFEST_GENERATE);

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let finalModel: string | undefined;

    for (let i = 0; i < chain.length; i++) {
      const { provider, model } = chain[i]!;
      const attemptNum = i + 1;

      yield {
        type: 'model-selected',
        provider: provider.name,
        model,
        attempt: attemptNum,
        chainLength: chain.length,
      };

      const state = this.assembler.create();
      const inputTokens = provider.tokenCount(MANIFEST_GENERATION_SYSTEM_PROMPT + userMessage);
      totalInputTokens += inputTokens;
      let attemptOutputTokens = 0;

      try {
        const maxOutputTokens = Number(process.env.AI_BUDGET_PER_TURN_OUTPUT_TOKENS) || DEFAULT_MAX_OUTPUT_TOKENS;
        const stream = provider.streamChat(
          {
            messages: [{ role: 'user', content: userMessage }],
            systemPrompt: MANIFEST_GENERATION_SYSTEM_PROMPT,
            model,
            maxTokens: maxOutputTokens,
            temperature: 0.2,
          },
          signal,
        );

        for await (const delta of stream) {
          attemptOutputTokens += provider.tokenCount(delta);
          yield { type: 'chunk', delta };
          const { valid, partial, changed } = this.assembler.ingest(state, delta);
          if (changed && valid) {
            yield { type: 'partial-manifest', manifest: valid };
          } else if (changed && partial) {
            yield { type: 'partial-manifest', manifest: partial };
          }
        }

        totalOutputTokens += attemptOutputTokens;

        const final = this.assembler.finalize(state);
        if (final.valid) {
          yield { type: 'final-manifest', manifest: final.valid };
          finalModel = model;
          yield { type: 'done', inputTokens: totalInputTokens, outputTokens: totalOutputTokens, finalModel };
          return;
        }

        // Stream ended but output didn't validate.
        const next = chain[i + 1];
        if (next) {
          this.logger.warn('manifest_invalid → falling back to next model', {
            correlationId,
            fromModel: model,
            nextModel: next.model,
          });
          yield { type: 'model-fallback', reason: 'manifest_invalid', fromModel: model, nextModel: next.model };
        } else {
          yield {
            type: 'error',
            code: 'MANIFEST_INVALID',
            message: 'No model in the chain produced a valid CellManifestV1.',
          };
        }
      } catch (err) {
        totalOutputTokens += attemptOutputTokens;
        const message = (err as Error).message;
        const next = chain[i + 1];
        if (next) {
          this.logger.warn('provider error → falling back to next model', {
            correlationId,
            fromModel: model,
            nextModel: next.model,
            message,
          });
          yield { type: 'model-fallback', reason: 'provider_error', fromModel: model, nextModel: next.model };
        } else {
          this.logger.error('manifest generation exhausted chain', { correlationId, message });
          yield { type: 'error', code: 'GENERATION_FAILED', message };
        }
      }
    }

    yield { type: 'done', inputTokens: totalInputTokens, outputTokens: totalOutputTokens, finalModel };
  }

  private prepare(prompt: string, correlationId: string): string {
    this.sizeGuard.enforce(prompt, MAX_PROMPT_BYTES, correlationId);
    return this.sanitizer.sanitize(prompt, {
      taskName: CELL_AI_TASKS.MANIFEST_GENERATE,
      correlationId,
    });
  }
}

function buildUserMessage(input: ManifestGenerationInput): string {
  const ctx = input.userContext;
  const header = ctx?.role || ctx?.companySize
    ? `Context: role=${ctx?.role ?? 'unspecified'}, companySize=${ctx?.companySize ?? 'unspecified'}.\n\n`
    : '';
  return `${header}Build an app described as: ${input.userPrompt}`;
}
