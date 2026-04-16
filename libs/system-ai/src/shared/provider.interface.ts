import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const generateChatInputSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  model: z.string().min(1),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  responseFormat: z.enum(['text', 'json']).optional(),
});
export type GenerateChatInput = z.infer<typeof generateChatInputSchema>;

export const generateChatOutputSchema = z.object({
  text: z.string(),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  model: z.string(),
  provider: z.string(),
  latencyMs: z.number().int().nonnegative(),
});
export type GenerateChatOutput = z.infer<typeof generateChatOutputSchema>;

export const PROVIDER_TIMEOUT_MS = 30_000;
export const STREAM_PROVIDER_TIMEOUT_MS = 90_000;

export interface AiProvider {
  readonly name: string;
  generateChat(input: GenerateChatInput, signal?: AbortSignal): Promise<GenerateChatOutput>;
  streamChat(input: GenerateChatInput, signal?: AbortSignal): AsyncIterable<string>;
  tokenCount(text: string): number;
}
