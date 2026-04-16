import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { ZodError } from 'zod';
import {
  makeCorrelationId,
  renderPromptPayload,
  type AiTaskExecutionTrace,
  type AiTaskRunInput,
  type AiTaskRunResult,
  type AiTaskStreamEvent,
} from '../../shared/task-runner.interface';
import { PROVIDER_TIMEOUT_MS, STREAM_PROVIDER_TIMEOUT_MS } from '../../shared/provider.interface';
import { ProviderRouter } from '../providers/provider.router';

@Injectable()
export class AiTaskRunner {
  constructor(private readonly providerRouter: ProviderRouter) {}

  async runTask<T>(input: AiTaskRunInput<T>): Promise<AiTaskRunResult<T>> {
    const startedAt = new Date().toISOString();
    const correlationId = makeCorrelationId(input.correlationId);
    const attempts: AiTaskExecutionTrace['attempts'] = [];
    const requestInput = toProviderInput(input);
    const chain = this.providerRouter.resolveChainForTask(input.taskId);

    for (let index = 0; index < chain.length; index += 1) {
      const step = chain[index]!;
      const attempt = index + 1;
      try {
        const abortController = new AbortController();
        const timer = setTimeout(() => abortController.abort(), PROVIDER_TIMEOUT_MS);
        const result = await step.provider.generateChat(
          {
            ...requestInput,
            model: step.model,
            responseFormat: input.structuredOutput ? 'json' : 'text',
          },
          abortController.signal,
        ).finally(() => clearTimeout(timer));

        const structured = input.structuredOutput
          ? parseStructuredOutput(result.text, input.structuredOutput.schema)
          : undefined;

        attempts.push({
          attempt,
          provider: step.providerName,
          configuredModel: step.model,
          resolvedModel: result.model,
          status: 'succeeded',
          latencyMs: result.latencyMs,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        });

        return {
          text: result.text,
          structured,
          provider: step.providerName,
          model: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          latencyMs: result.latencyMs,
          trace: {
            correlationId,
            taskId: input.taskId,
            profile: step.profile,
            startedAt,
            completedAt: new Date().toISOString(),
            metadata: input.metadata,
            attempts,
          },
        };
      } catch (error) {
        const normalizedError = normalizeExecutionError(error);
        attempts.push({
          attempt,
          provider: step.providerName,
          configuredModel: step.model,
          status: normalizedError.kind === 'structured_output_invalid'
            ? 'structured_output_invalid'
            : 'provider_error',
          latencyMs: 0,
          inputTokens: 0,
          outputTokens: 0,
          error: normalizedError.message,
        });

        if (attempt < chain.length) {
          continue;
        }

        throw new ServiceUnavailableException({
          message: normalizedError.message,
          correlationId,
          taskId: input.taskId,
          trace: {
            correlationId,
            taskId: input.taskId,
            profile: step.profile,
            startedAt,
            completedAt: new Date().toISOString(),
            metadata: input.metadata,
            attempts,
          },
        });
      }
    }

    throw new ServiceUnavailableException(`No execution attempts were available for task "${input.taskId}".`);
  }

  async *streamTask(input: AiTaskRunInput): AsyncIterable<AiTaskStreamEvent> {
    const startedAt = new Date().toISOString();
    const correlationId = makeCorrelationId(input.correlationId);
    const attempts: AiTaskExecutionTrace['attempts'] = [];
    const requestInput = toProviderInput(input);
    const chain = this.providerRouter.resolveChainForTask(input.taskId);

    for (let index = 0; index < chain.length; index += 1) {
      const step = chain[index]!;
      const attempt = index + 1;
      const attemptStartedAt = Date.now();

      yield {
        type: 'attempt-started',
        attempt,
        chainLength: chain.length,
        provider: step.providerName,
        model: step.model,
        correlationId,
      };

      try {
        const abortController = new AbortController();
        const timer = setTimeout(() => abortController.abort(), STREAM_PROVIDER_TIMEOUT_MS);
        let outputTokens = 0;

        try {
          for await (const delta of step.provider.streamChat(
            {
              ...requestInput,
              model: step.model,
              responseFormat: input.structuredOutput ? 'json' : 'text',
            },
            abortController.signal,
          )) {
            outputTokens += step.provider.tokenCount(delta);
            yield {
              type: 'chunk',
              delta,
            };
          }
        } finally {
          clearTimeout(timer);
        }

        const inputTokens = step.provider.tokenCount(
          `${requestInput.systemPrompt ?? ''}\n${requestInput.messages.map((message) => message.content).join('\n')}`,
        );

        attempts.push({
          attempt,
          provider: step.providerName,
          configuredModel: step.model,
          resolvedModel: step.model,
          status: 'succeeded',
          latencyMs: Date.now() - attemptStartedAt,
          inputTokens,
          outputTokens,
        });

        yield {
          type: 'completed',
          provider: step.providerName,
          model: step.model,
          inputTokens,
          outputTokens,
          latencyMs: Date.now() - attemptStartedAt,
          trace: {
            correlationId,
            taskId: input.taskId,
            profile: step.profile,
            startedAt,
            completedAt: new Date().toISOString(),
            metadata: input.metadata,
            attempts,
          },
        };
        return;
      } catch (error) {
        const message = normalizeExecutionError(error).message;
        attempts.push({
          attempt,
          provider: step.providerName,
          configuredModel: step.model,
          status: 'provider_error',
          latencyMs: Date.now() - attemptStartedAt,
          inputTokens: 0,
          outputTokens: 0,
          error: message,
        });

        if (attempt < chain.length) {
          yield {
            type: 'attempt-fallback',
            attempt,
            provider: step.providerName,
            model: step.model,
            nextModel: chain[index + 1]?.model,
            reason: 'provider_error',
            error: message,
          };
          continue;
        }

        yield {
          type: 'failed',
          error: message,
          trace: {
            correlationId,
            taskId: input.taskId,
            profile: step.profile,
            startedAt,
            completedAt: new Date().toISOString(),
            metadata: input.metadata,
            attempts,
          },
        };
        return;
      }
    }
  }
}

function toProviderInput<T>(input: AiTaskRunInput<T>) {
  const messages = input.messages && input.messages.length > 0
    ? input.messages
    : [{ role: 'user' as const, content: renderPromptPayload(input.promptPayload) }];

  return {
    messages,
    systemPrompt: input.systemPrompt,
    maxTokens: input.maxTokens,
    temperature: input.temperature,
  };
}

function parseStructuredOutput<T>(
  text: string,
  schema: { parse: (value: unknown) => T },
): T {
  const extracted = extractJsonPayload(text);
  return schema.parse(JSON.parse(extracted));
}

function extractJsonPayload(text: string): string {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
  const firstObject = trimmed.indexOf('{');
  const firstArray = trimmed.indexOf('[');
  const startIndex =
    firstObject === -1
      ? firstArray
      : firstArray === -1
        ? firstObject
        : Math.min(firstObject, firstArray);
  if (startIndex === -1) {
    throw new Error('Structured output did not contain JSON.');
  }
  return trimmed.slice(startIndex);
}

function normalizeExecutionError(error: unknown): { kind: 'provider_error' | 'structured_output_invalid'; message: string } {
  if (looksLikeZodError(error)) {
    return {
      kind: 'structured_output_invalid',
      message: error.issues
        .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
        .join('; '),
    };
  }

  return {
    kind: 'provider_error',
    message: error instanceof Error ? error.message : String(error),
  };
}

function looksLikeZodError(error: unknown): error is ZodError {
  return typeof error === 'object'
    && error !== null
    && 'issues' in error
    && Array.isArray((error as { issues?: unknown[] }).issues);
}
