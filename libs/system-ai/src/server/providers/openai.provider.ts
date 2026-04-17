import { ServiceUnavailableException } from '@nestjs/common';
import type {
  AiProvider,
  GenerateChatInput,
  GenerateChatOutput,
  ProviderRateLimitHeaders,
} from '../../shared/provider.interface';
import { readSseData } from './sse';
import { RateLimitedException, parseRetryAfterMs } from './rate-limited-exception';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_RETRY_AFTER_MS = 5_000;

interface OpenAiCompatibleProviderOptions {
  readonly name: string;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly headers?: Record<string, string>;
}

export class OpenAiCompatibleProvider implements AiProvider {
  readonly name: string;

  constructor(private readonly options: OpenAiCompatibleProviderOptions) {
    this.name = options.name;
  }

  async generateChat(input: GenerateChatInput, signal?: AbortSignal): Promise<GenerateChatOutput> {
    const startedAt = Date.now();
    const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.options.apiKey}`,
        ...this.options.headers,
      },
      body: JSON.stringify({
        model: input.model,
        messages: toOpenAiMessages(input),
        max_tokens: input.maxTokens ?? 2048,
        temperature: input.temperature,
        ...(input.responseFormat === 'json'
          ? { response_format: { type: 'json_object' } }
          : {}),
      }),
      signal,
    });

    const rateLimitHeaders = readRateLimitHeaders(response);
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      this.throwErrorForStatus(response.status, body, rateLimitHeaders);
    }

    const message = (body as { choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }> })
      ?.choices?.[0]?.message?.content;

    return {
      text: extractOpenAiContent(message),
      inputTokens: (body as { usage?: { prompt_tokens?: number } })?.usage?.prompt_tokens ?? 0,
      outputTokens: (body as { usage?: { completion_tokens?: number } })?.usage?.completion_tokens ?? 0,
      model: (body as { model?: string })?.model ?? input.model,
      provider: this.name,
      latencyMs: Date.now() - startedAt,
      headers: rateLimitHeaders,
    };
  }

  async *streamChat(input: GenerateChatInput, signal?: AbortSignal): AsyncIterable<string> {
    const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.options.apiKey}`,
        ...this.options.headers,
      },
      body: JSON.stringify({
        model: input.model,
        messages: toOpenAiMessages(input),
        max_tokens: input.maxTokens ?? 2048,
        temperature: input.temperature,
        stream: true,
        ...(input.responseFormat === 'json'
          ? { response_format: { type: 'json_object' } }
          : {}),
      }),
      signal,
    });

    if (!response.ok) {
      const rateLimitHeaders = readRateLimitHeaders(response);
      const body = await response.json().catch(() => null);
      this.throwErrorForStatus(response.status, body, rateLimitHeaders);
    }

    if (!response.body) {
      throw new ServiceUnavailableException(`${this.name}: streaming response body missing.`);
    }

    for await (const raw of readSseData(response.body)) {
      if (raw === '[DONE]') break;
      const chunk = JSON.parse(raw) as {
        choices?: Array<{ delta?: { content?: string | Array<{ text?: string }> } }>;
      };
      const delta = chunk.choices?.[0]?.delta?.content;
      const text = extractOpenAiContent(delta);
      if (text) yield text;
    }
  }

  tokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private throwErrorForStatus(status: number, body: unknown, headers: ProviderRateLimitHeaders | undefined): never {
    const message = buildProviderError(this.name, status, body);
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

function readRateLimitHeaders(response: Response): ProviderRateLimitHeaders | undefined {
  const retryAfter = response.headers.get('retry-after');
  const tokensRemaining = toInt(
    response.headers.get('x-ratelimit-remaining-tokens') ?? response.headers.get('x-ratelimit-remaining'),
  );
  const tokensReset =
    response.headers.get('x-ratelimit-reset-tokens') ?? response.headers.get('x-ratelimit-reset');
  const requestsRemaining = toInt(response.headers.get('x-ratelimit-remaining-requests'));
  const requestsReset = response.headers.get('x-ratelimit-reset-requests');

  const headers: ProviderRateLimitHeaders = {};
  if (retryAfter) headers.retryAfterMs = parseRetryAfterMs(retryAfter, DEFAULT_RETRY_AFTER_MS);
  if (tokensRemaining !== undefined) headers.tokensRemaining = tokensRemaining;
  if (tokensReset) headers.tokensReset = tokensReset;
  if (requestsRemaining !== undefined) headers.requestsRemaining = requestsRemaining;
  if (requestsReset) headers.requestsReset = requestsReset;

  return Object.keys(headers).length > 0 ? headers : undefined;
}

function toInt(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : undefined;
}

export class OpenAiProvider extends OpenAiCompatibleProvider {
  constructor(apiKey: string, baseUrl: string = OPENAI_BASE_URL) {
    super({
      name: 'openai',
      apiKey,
      baseUrl,
    });
  }
}

function toOpenAiMessages(input: GenerateChatInput): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  if (input.systemPrompt) {
    messages.push({
      role: 'system',
      content: input.systemPrompt,
    });
  }
  for (const message of input.messages) {
    messages.push({
      role: message.role,
      content: message.content,
    });
  }
  return messages;
}

function extractOpenAiContent(
  content: string | Array<{ text?: string }> | undefined,
): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  return content
    .map((entry) => entry.text ?? '')
    .join('');
}

function buildProviderError(name: string, status: number, body: unknown): string {
  const errorMessage =
    (body as { error?: { message?: string } })?.error?.message
    ?? (body as { message?: string })?.message
    ?? 'unknown error';
  return `${name}: HTTP ${status} - ${errorMessage}`;
}
