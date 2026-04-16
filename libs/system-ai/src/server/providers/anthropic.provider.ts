import { ServiceUnavailableException } from '@nestjs/common';
import type {
  AiProvider,
  GenerateChatInput,
  GenerateChatOutput,
} from '../../shared/provider.interface';
import { readSseData } from './sse';

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';

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
      body: JSON.stringify({
        model: input.model,
        system: input.systemPrompt,
        max_tokens: input.maxTokens ?? 2048,
        temperature: input.temperature ?? 0,
        messages: input.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
      signal,
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ServiceUnavailableException(buildAnthropicError(response.status, body));
    }

    return {
      text: extractAnthropicContent((body as { content?: Array<{ type?: string; text?: string }> })?.content),
      inputTokens: (body as { usage?: { input_tokens?: number } })?.usage?.input_tokens ?? 0,
      outputTokens: (body as { usage?: { output_tokens?: number } })?.usage?.output_tokens ?? 0,
      model: (body as { model?: string })?.model ?? input.model,
      provider: this.name,
      latencyMs: Date.now() - startedAt,
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
      body: JSON.stringify({
        model: input.model,
        system: input.systemPrompt,
        max_tokens: input.maxTokens ?? 2048,
        temperature: input.temperature ?? 0,
        stream: true,
        messages: input.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
      signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ServiceUnavailableException(buildAnthropicError(response.status, body));
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
