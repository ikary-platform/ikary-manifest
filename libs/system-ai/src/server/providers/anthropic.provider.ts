import { ServiceUnavailableException } from '@nestjs/common';
import type {
  AiProvider,
  GenerateChatInput,
  GenerateChatOutput,
  ProviderRateLimitHeaders,
} from '../../shared/provider.interface';
import { readSseData } from './sse';
import { RateLimitedException, parseRetryAfterMs } from './rate-limited-exception';

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';
/**
 * Conservative character threshold below which Anthropic will silently ignore
 * a `cache_control` marker. Haiku 4.5 and Opus 4.x require 4096 tokens; we use
 * 16000 characters as a ~4x safety margin on the 4-chars-per-token heuristic.
 */
const CACHE_MIN_CHARS = 16_000;
const DEFAULT_RETRY_AFTER_MS = 5_000;

export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = ANTHROPIC_BASE_URL,
  ) {}

  async generateChat(input: GenerateChatInput, signal?: AbortSignal): Promise<GenerateChatOutput> {
    const startedAt = Date.now();
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(buildRequestBody(input, /*stream*/ false)),
      signal,
    });

    const rateLimitHeaders = readRateLimitHeaders(response);
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      this.throwErrorForStatus(response.status, body, rateLimitHeaders);
    }

    const usage = (body as { usage?: { input_tokens?: number; output_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number } })?.usage;
    return {
      text: extractAnthropicContent((body as { content?: Array<{ type?: string; text?: string }> })?.content),
      inputTokens: usage?.input_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
      cacheReadTokens: usage?.cache_read_input_tokens,
      cacheWriteTokens: usage?.cache_creation_input_tokens,
      model: (body as { model?: string })?.model ?? input.model,
      provider: this.name,
      latencyMs: Date.now() - startedAt,
      headers: rateLimitHeaders,
    };
  }

  async *streamChat(input: GenerateChatInput, signal?: AbortSignal): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(buildRequestBody(input, /*stream*/ true)),
      signal,
    });

    if (!response.ok) {
      const rateLimitHeaders = readRateLimitHeaders(response);
      const body = await response.json().catch(() => null);
      this.throwErrorForStatus(response.status, body, rateLimitHeaders);
    }

    if (!response.body) {
      throw new ServiceUnavailableException('anthropic: streaming response body missing.');
    }

    for await (const raw of readSseData(response.body)) {
      if (!raw) continue;
      const event = JSON.parse(raw) as {
        type?: string;
        delta?: { text?: string };
      };
      if (event.type === 'content_block_delta' && event.delta?.text) {
        yield event.delta.text;
      }
    }
  }

  tokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private throwErrorForStatus(status: number, body: unknown, headers: ProviderRateLimitHeaders | undefined): never {
    const message = buildAnthropicError(status, body);
    if (status === 429) {
      throw new RateLimitedException({
        message,
        provider: this.name,
        retryAfterMs: headers?.retryAfterMs ?? DEFAULT_RETRY_AFTER_MS,
        headers,
      });
    }
    throw new ServiceUnavailableException(message);
  }
}

function buildRequestBody(input: GenerateChatInput, stream: boolean): Record<string, unknown> {
  const base: Record<string, unknown> = {
    model: input.model,
    max_tokens: input.maxTokens ?? 2048,
    temperature: input.temperature ?? 0,
    messages: input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  };
  if (stream) base.stream = true;
  if (input.systemPrompt !== undefined) {
    base.system = wrapSystemForCache(input.systemPrompt);
  }
  return base;
}

function wrapSystemForCache(systemPrompt: string): unknown {
  const cachingEnabled = process.env.AI_PROMPT_CACHE_ENABLED !== 'false';
  if (!cachingEnabled || systemPrompt.length < CACHE_MIN_CHARS) {
    return systemPrompt;
  }
  return [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

function readRateLimitHeaders(response: Response): ProviderRateLimitHeaders | undefined {
  const retryAfter = response.headers.get('retry-after');
  const tokensRemainingRaw = response.headers.get('anthropic-ratelimit-tokens-remaining');
  const tokensReset = response.headers.get('anthropic-ratelimit-tokens-reset');
  const requestsRemainingRaw = response.headers.get('anthropic-ratelimit-requests-remaining');
  const requestsReset = response.headers.get('anthropic-ratelimit-requests-reset');

  const headers: ProviderRateLimitHeaders = {};
  if (retryAfter) headers.retryAfterMs = parseRetryAfterMs(retryAfter, DEFAULT_RETRY_AFTER_MS);
  const tokensRemaining = toInt(tokensRemainingRaw);
  if (tokensRemaining !== undefined) headers.tokensRemaining = tokensRemaining;
  if (tokensReset) headers.tokensReset = tokensReset;
  const requestsRemaining = toInt(requestsRemainingRaw);
  if (requestsRemaining !== undefined) headers.requestsRemaining = requestsRemaining;
  if (requestsReset) headers.requestsReset = requestsReset;

  return Object.keys(headers).length > 0 ? headers : undefined;
}

function toInt(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : undefined;
}

function extractAnthropicContent(content: Array<{ type?: string; text?: string }> | undefined): string {
  if (!content) return '';
  return content
    .filter((entry) => entry.type === 'text')
    .map((entry) => entry.text ?? '')
    .join('');
}

function buildAnthropicError(status: number, body: unknown): string {
  const errorMessage =
    (body as { error?: { message?: string } })?.error?.message
    ?? (body as { message?: string })?.message
    ?? 'unknown error';
  return `anthropic: HTTP ${status} - ${errorMessage}`;
}
