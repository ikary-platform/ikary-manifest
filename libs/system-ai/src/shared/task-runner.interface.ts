import type { ZodType } from 'zod';
import type { ChatMessage } from './provider.interface';

export type AiPromptPayload =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];

export interface StructuredOutputSpec<T> {
  readonly schema: ZodType<T>;
  readonly name?: string;
}

export interface AiTaskRunInput<T = unknown> {
  readonly taskId: string;
  readonly promptPayload?: AiPromptPayload;
  readonly messages?: ChatMessage[];
  readonly systemPrompt?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly correlationId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly structuredOutput?: StructuredOutputSpec<T>;
}

export interface AiTaskAttemptTrace {
  readonly attempt: number;
  readonly provider: string;
  readonly configuredModel: string;
  readonly resolvedModel?: string;
  readonly status: 'succeeded' | 'provider_error' | 'structured_output_invalid';
  readonly latencyMs: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly error?: string;
}

export interface AiTaskExecutionTrace {
  readonly correlationId: string;
  readonly taskId: string;
  readonly profile: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly metadata?: Record<string, unknown>;
  readonly attempts: AiTaskAttemptTrace[];
}

export interface AiTaskRunResult<T = unknown> {
  readonly text: string;
  readonly structured?: T;
  readonly provider: string;
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly latencyMs: number;
  readonly trace: AiTaskExecutionTrace;
}

export type AiTaskStreamEvent =
  | {
      readonly type: 'attempt-started';
      readonly attempt: number;
      readonly chainLength: number;
      readonly provider: string;
      readonly model: string;
      readonly correlationId: string;
    }
  | {
      readonly type: 'chunk';
      readonly delta: string;
    }
  | {
      readonly type: 'attempt-fallback';
      readonly attempt: number;
      readonly provider: string;
      readonly model: string;
      readonly nextModel?: string;
      readonly reason: 'provider_error';
      readonly error: string;
    }
  | {
      readonly type: 'completed';
      readonly provider: string;
      readonly model: string;
      readonly inputTokens: number;
      readonly outputTokens: number;
      readonly latencyMs: number;
      readonly trace: AiTaskExecutionTrace;
    }
  | {
      readonly type: 'failed';
      readonly error: string;
      readonly trace: AiTaskExecutionTrace;
    };

export function makeCorrelationId(value?: string): string {
  if (value?.trim()) return value;
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `corr-${Date.now()}`;
}

export function renderPromptPayload(payload: AiPromptPayload | undefined): string {
  if (payload === undefined) return '';
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'number' || typeof payload === 'boolean' || payload === null) {
    return String(payload);
  }
  return JSON.stringify(payload, null, 2);
}
