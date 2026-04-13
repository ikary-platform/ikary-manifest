import { ServiceUnavailableException } from '@nestjs/common';
import type {
  AiProvider,
  GenerateChatInput,
  GenerateChatOutput,
} from '../../shared/provider.interface';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterProvider implements AiProvider {
  readonly name = 'openrouter';

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = OPENROUTER_BASE_URL,
  ) {}

  async generateChat(input: GenerateChatInput, signal?: AbortSignal): Promise<GenerateChatOutput> {
    const start = Date.now();
    try {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseUrl,
        defaultHeaders: openRouterHeaders(),
      });
      const messages = buildMessages(input);
      const response = await client.chat.completions.create(
        {
          model: input.model,
          messages,
          max_tokens: input.maxTokens ?? 2048,
          temperature: input.temperature,
        },
        { signal },
      );
      const choice = response.choices[0];
      return {
        text: choice?.message?.content ?? '',
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        model: response.model,
        provider: this.name,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      const msg = (error as { message?: string; status?: number; code?: string })?.message ?? 'unknown error';
      const status = (error as { status?: number }).status;
      throw new ServiceUnavailableException(
        `OpenRouter: ${status ? `HTTP ${status} - ` : ''}${msg}`,
      );
    }
  }

  async *streamChat(input: GenerateChatInput, signal?: AbortSignal): AsyncIterable<string> {
    try {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseUrl,
        defaultHeaders: openRouterHeaders(),
      });
      const messages = buildMessages(input);
      const stream = await client.chat.completions.create(
        {
          model: input.model,
          messages,
          max_tokens: input.maxTokens ?? 2048,
          temperature: input.temperature,
          stream: true,
        },
        { signal },
      );
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) yield content;
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      const msg = (error as { message?: string; status?: number; code?: string })?.message ?? 'unknown error';
      const status = (error as { status?: number }).status;
      throw new ServiceUnavailableException(
        `OpenRouter: ${status ? `HTTP ${status} - ` : ''}${msg}`,
      );
    }
  }

  tokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

function buildMessages(input: GenerateChatInput) {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  if (input.systemPrompt) messages.push({ role: 'system', content: input.systemPrompt });
  for (const m of input.messages) messages.push({ role: m.role, content: m.content });
  return messages;
}

function openRouterHeaders(): Record<string, string> {
  return {
    'HTTP-Referer': 'https://try.ikary.co',
    'X-Title': 'Ikary Try',
  };
}
