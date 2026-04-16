import { Inject, Injectable, Logger } from '@nestjs/common';
import { AiTaskRunner, PromptSanitizer, InputSizeGuard } from '@ikary/system-ai/server';
import { PromptRegistryService } from '@ikary/system-prompt/server';
import { CELL_AI_TASKS } from '../shared/task-id';
import type { ManifestGenerationInput, ManifestStreamEvent } from '../shared/manifest-generation.schema';
import { PartialManifestAssembler } from './partial-manifest-assembler';

const MAX_PROMPT_BYTES = 8_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 2000;

@Injectable()
export class ManifestGeneratorService {
  private readonly logger = new Logger(ManifestGeneratorService.name);

  constructor(
    @Inject(AiTaskRunner) private readonly taskRunner: AiTaskRunner,
    @Inject(PromptSanitizer) private readonly sanitizer: PromptSanitizer,
    @Inject(InputSizeGuard) private readonly sizeGuard: InputSizeGuard,
    @Inject(PartialManifestAssembler) private readonly assembler: PartialManifestAssembler,
    @Inject(PromptRegistryService) private readonly prompts: PromptRegistryService,
  ) {}

  async *streamManifest(
    input: ManifestGenerationInput,
    correlationId: string,
    signal?: AbortSignal,
  ): AsyncGenerator<ManifestStreamEvent> {
    const userPrompt = this.prepare(input.userPrompt, correlationId);
    const userMessage = buildUserMessage(input, userPrompt);
    const state = this.assembler.create();
    const maxOutputTokens = Number(process.env.AI_BUDGET_PER_TURN_OUTPUT_TOKENS) || DEFAULT_MAX_OUTPUT_TOKENS;

    const systemPrompt = this.prompts.render(
      'cell-ai/manifest-generation',
      {},
      { correlationId, taskName: CELL_AI_TASKS.MANIFEST_GENERATE },
    );

    for await (const event of this.taskRunner.streamTask({
      taskId: CELL_AI_TASKS.MANIFEST_CREATE,
      promptPayload: userMessage,
      systemPrompt,
      maxTokens: maxOutputTokens,
      temperature: 0.2,
      correlationId,
    })) {
      if (event.type === 'attempt-started') {
        yield {
          type: 'model-selected',
          provider: event.provider,
          model: event.model,
          attempt: event.attempt,
          chainLength: event.chainLength,
        };
        continue;
      }

      if (event.type === 'chunk') {
        yield { type: 'chunk', delta: event.delta };
        const { valid, partial, changed } = this.assembler.ingest(state, event.delta);
        if (changed && valid) {
          yield { type: 'partial-manifest', manifest: valid };
        } else if (changed && partial) {
          yield { type: 'partial-manifest', manifest: partial };
        }
        continue;
      }

      if (event.type === 'attempt-fallback') {
        this.logger.warn('provider error → falling back to next model', {
          correlationId,
          fromModel: event.model,
          nextModel: event.nextModel,
          message: event.error,
        });
        yield {
          type: 'model-fallback',
          reason: 'provider_error',
          fromModel: event.model,
          nextModel: event.nextModel ?? '',
        };
        continue;
      }

      if (event.type === 'completed') {
        const final = this.assembler.finalize(state);
        if (final.valid) {
          yield { type: 'final-manifest', manifest: final.valid };
        } else {
          yield {
            type: 'error',
            code: 'MANIFEST_INVALID',
            message: 'The streamed output did not resolve to a valid CellManifestV1.',
          };
        }
        yield {
          type: 'done',
          inputTokens: event.inputTokens,
          outputTokens: event.outputTokens,
          finalModel: event.model,
        };
        return;
      }

      if (event.type === 'failed') {
        this.logger.error('manifest generation exhausted chain', { correlationId, message: event.error });
        yield {
          type: 'error',
          code: 'GENERATION_FAILED',
          message: event.error,
        };
        yield {
          type: 'done',
          inputTokens: 0,
          outputTokens: 0,
          finalModel: undefined,
        };
        return;
      }
    }
  }

  private prepare(prompt: string, correlationId: string): string {
    this.sizeGuard.enforce(prompt, MAX_PROMPT_BYTES, correlationId);
    return this.sanitizer.sanitize(prompt, {
      taskName: CELL_AI_TASKS.MANIFEST_GENERATE,
      correlationId,
    });
  }
}

function buildUserMessage(input: ManifestGenerationInput, sanitizedPrompt: string): string {
  const ctx = input.userContext;
  const header = ctx?.role || ctx?.companySize
    ? `Context: role=${ctx?.role ?? 'unspecified'}, companySize=${ctx?.companySize ?? 'unspecified'}.\n\n`
    : '';
  return `${header}Build an app described as: ${sanitizedPrompt}`;
}
