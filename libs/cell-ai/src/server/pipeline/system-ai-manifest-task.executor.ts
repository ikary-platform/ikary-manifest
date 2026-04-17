import { HttpException, Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { z } from 'zod';
import { CellManifestV1Schema } from '@ikary/cell-contract';
import { AiTaskRunner } from '@ikary/system-ai/server';
import type { AiTaskAttemptTrace, AiTaskRunResult } from '@ikary/system-ai';
import { PromptRegistryService } from '@ikary/system-prompt/server';
import { IkaryMcpClient, type McpValidationError } from '@ikary/system-mcp/server';
import type { ManifestTaskExecutor, ManifestExecutorResult } from './interfaces';
import type { ManifestTaskInput } from '../../shared/pipeline.schema';

const FALLBACK_SCHEMA_REFERENCE =
  'Schema reference temporarily unavailable; rely on the REFERENCE EXAMPLE below for shape.';

/** Permissive schema used to surface raw JSON from the runner. MCP becomes the actual validator. */
const PassthroughManifestSchema = z.record(z.unknown());

@Injectable()
export class SystemAiManifestTaskExecutor implements ManifestTaskExecutor {
  readonly name = 'system-ai-manifest-task-executor';
  private readonly logger = new Logger(SystemAiManifestTaskExecutor.name);
  private schemaReferencePromise: Promise<string> | null = null;

  constructor(
    @Inject(AiTaskRunner) private readonly aiTaskRunner: AiTaskRunner,
    @Inject(PromptRegistryService) private readonly prompts: PromptRegistryService,
    @Optional() @Inject(IkaryMcpClient) private readonly mcp?: IkaryMcpClient,
  ) {}

  async execute(input: {
    task: ManifestTaskInput;
    context: { promptContext: string };
  }): Promise<ManifestExecutorResult> {
    const schemaReference = await this.getSchemaReference();
    const accumulatedAttempts: AiTaskAttemptTrace[] = [];
    let lastSystemPrompt = '';
    let promptContext = input.context.promptContext;
    let taskType: ManifestTaskInput['type'] = input.task.type;
    const maxFixAttempts = resolveMaxFixAttempts();
    const backoffBaseMs = resolveBackoffBaseMs();

    for (let attempt = 0; attempt <= maxFixAttempts; attempt += 1) {
      if (attempt > 0) {
        await sleepWithJitter(backoffBaseMs, attempt);
      }
      const generation = await this.runOnce({
        taskType,
        promptContext,
        schemaReference,
      });
      lastSystemPrompt = generation.systemPrompt;
      mergeAttempts(accumulatedAttempts, generation);

      if (!generation.aiResult) {
        return {
          error: generation.error ?? 'Manifest executor did not produce output.',
          attempts: accumulatedAttempts,
          systemPrompt: lastSystemPrompt,
        };
      }

      const candidate = (generation.aiResult.structured ?? safeJsonParse(generation.aiResult.text)) as unknown;
      if (!candidate || typeof candidate !== 'object') {
        return {
          error: 'Model response did not parse as a JSON object.',
          aiResult: generation.aiResult,
          attempts: accumulatedAttempts,
          systemPrompt: lastSystemPrompt,
        };
      }

      const validation = await this.validate(candidate);

      if (validation.valid) {
        return {
          manifest: candidate,
          aiResult: generation.aiResult,
          attempts: accumulatedAttempts,
          systemPrompt: lastSystemPrompt,
        };
      }

      if (attempt >= maxFixAttempts) {
        return {
          manifest: candidate,
          error: this.summarizeErrors(validation),
          aiResult: generation.aiResult,
          attempts: accumulatedAttempts,
          systemPrompt: lastSystemPrompt,
        };
      }

      // Build the next loop's fix prompt and continue.
      promptContext = await this.buildFixPrompt(promptContext, candidate, validation);
      taskType = 'fix';
    }

    return {
      error: 'Manifest executor exhausted all generation attempts without producing a valid manifest.',
      attempts: accumulatedAttempts,
      systemPrompt: lastSystemPrompt,
    };
  }

  private async runOnce(args: {
    taskType: ManifestTaskInput['type'];
    promptContext: string;
    schemaReference: string;
  }): Promise<{ aiResult?: AiTaskRunResult<unknown>; systemPrompt: string; error?: string; errorAttempts?: AiTaskAttemptTrace[] }> {
    const systemPrompt = this.prompts.render(
      'cell-ai/manifest',
      { task_type: args.taskType, schema_reference: args.schemaReference },
      { taskName: 'cell-ai/manifest' },
    );
    try {
      const aiResult = await this.aiTaskRunner.runTask({
        taskId: toTaskId(args.taskType),
        promptPayload: args.promptContext,
        systemPrompt,
        temperature: 0.1,
        maxTokens: resolveMaxOutputTokens(),
        metadata: { taskKind: args.taskType },
        structuredOutput: {
          name: 'cell-manifest',
          schema: PassthroughManifestSchema,
        },
      });
      return { aiResult, systemPrompt };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        errorAttempts: extractAttemptsFromError(error),
        systemPrompt,
      };
    }
  }

  private async validate(candidate: unknown): Promise<ValidationOutcome> {
    if (!this.mcp) {
      return this.inCodeValidate(candidate, 'no-mcp-client');
    }
    try {
      const result = await this.mcp.validateManifest(candidate);
      return {
        valid: result.valid,
        errors: result.errors,
        validator: 'mcp',
      };
    } catch (error) {
      this.logger.warn(`MCP validation unreachable, falling back to in-code validator: ${error instanceof Error ? error.message : String(error)}`);
      return this.inCodeValidate(candidate, 'in-code-fallback');
    }
  }

  private inCodeValidate(candidate: unknown, reason: ValidationOutcome['validator']): ValidationOutcome {
    const parsed = CellManifestV1Schema.safeParse(candidate);
    if (parsed.success) {
      return { valid: true, errors: [], validator: reason };
    }
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      })),
      validator: reason,
    };
  }

  private async buildFixPrompt(
    originalContext: string,
    brokenManifest: unknown,
    validation: ValidationOutcome,
  ): Promise<string> {
    let guidanceText = '';
    if (this.mcp && validation.errors.length > 0) {
      try {
        const explained = await this.mcp.explainErrors(validation.errors);
        if (explained.guidance.length > 0) {
          guidanceText = explained.guidance
            .map((entry: { field: string; message: string; suggestion?: string }) =>
              `- ${entry.field}: ${entry.message}${entry.suggestion ? ` (try: ${entry.suggestion})` : ''}`)
            .join('\n');
        }
      } catch {
        // explainErrors is advisory; ignore failure.
      }
    }

    const errorList = validation.errors
      .map((entry) => `- ${entry.field}: ${entry.message}`)
      .join('\n') || '(validator returned no detail)';

    return [
      originalContext,
      '',
      'Previously generated manifest (rejected by validator):',
      JSON.stringify(brokenManifest, null, 2),
      '',
      'Validation errors that must be fixed:',
      errorList,
      ...(guidanceText ? ['', 'Validator guidance:', guidanceText] : []),
    ].join('\n');
  }

  private async getSchemaReference(): Promise<string> {
    if (!this.mcp) return FALLBACK_SCHEMA_REFERENCE;
    if (!this.schemaReferencePromise) {
      const mcp = this.mcp;
      this.schemaReferencePromise = (async () => {
        try {
          const text = await mcp.getManifestSchemaText();
          return text.length > 0 ? text : FALLBACK_SCHEMA_REFERENCE;
        } catch (error) {
          this.logger.warn(
            `Could not fetch MCP schema reference, using fallback: ${error instanceof Error ? error.message : String(error)}`,
          );
          return FALLBACK_SCHEMA_REFERENCE;
        }
      })();
    }
    return this.schemaReferencePromise;
  }

  private summarizeErrors(validation: ValidationOutcome): string {
    const summary = validation.errors
      .slice(0, 3)
      .map((entry) => `${entry.field}: ${entry.message}`)
      .join('; ');
    return `Manifest failed ${validation.validator} validation: ${summary || 'no detail'}`;
  }
}

interface ValidationOutcome {
  readonly valid: boolean;
  readonly errors: McpValidationError[];
  readonly validator: 'mcp' | 'in-code-fallback' | 'no-mcp-client';
}

function mergeAttempts(
  accumulated: AiTaskAttemptTrace[],
  generation: { aiResult?: AiTaskRunResult<unknown>; errorAttempts?: AiTaskAttemptTrace[] },
): void {
  if (generation.aiResult?.trace.attempts) {
    accumulated.push(...generation.aiResult.trace.attempts);
  } else if (generation.errorAttempts) {
    accumulated.push(...generation.errorAttempts);
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function resolveMaxOutputTokens(): number {
  const raw = Number(process.env.AI_BUDGET_PER_TURN_OUTPUT_TOKENS);
  return Number.isFinite(raw) && raw > 0 ? raw : 6000;
}

function resolveMaxFixAttempts(): number {
  const raw = Number(process.env.MANIFEST_VALIDATION_MAX_FIX_ATTEMPTS);
  return Number.isFinite(raw) && raw >= 0 ? raw : 2;
}

function resolveBackoffBaseMs(): number {
  const raw = Number(process.env.AI_RATE_LIMIT_BACKOFF_BASE_MS);
  return Number.isFinite(raw) && raw >= 0 ? raw : 500;
}

async function sleepWithJitter(baseMs: number, attempt: number): Promise<void> {
  if (baseMs <= 0) return;
  const exponent = Math.min(attempt - 1, 6);
  const target = Math.min(baseMs * 2 ** exponent, 10_000);
  const jittered = target * (1 + Math.random() * 0.2);
  await new Promise((resolve) => setTimeout(resolve, jittered));
}

function extractAttemptsFromError(error: unknown): AiTaskAttemptTrace[] | undefined {
  if (!(error instanceof HttpException)) return undefined;
  const response = error.getResponse();
  if (typeof response !== 'object' || response === null) return undefined;
  const trace = (response as { trace?: { attempts?: AiTaskAttemptTrace[] } }).trace;
  return Array.isArray(trace?.attempts) ? trace.attempts : undefined;
}

function toTaskId(type: ManifestTaskInput['type']): string {
  switch (type) {
    case 'create':
      return 'manifest.create';
    case 'fix':
      return 'manifest.fix';
    case 'update':
      return 'manifest.update';
  }
}
