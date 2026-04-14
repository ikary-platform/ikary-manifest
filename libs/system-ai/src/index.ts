export type {
  ChatMessage,
  GenerateChatInput,
  GenerateChatOutput,
  AiProvider,
} from './shared/provider.interface';
export {
  chatMessageSchema,
  generateChatInputSchema,
  generateChatOutputSchema,
  PROVIDER_TIMEOUT_MS,
  STREAM_PROVIDER_TIMEOUT_MS,
} from './shared/provider.interface';

export type {
  ProviderName,
  ProviderCreds,
  BudgetEnvelope,
  AiRuntimeConfig,
  TaskModelValue,
} from './shared/config.schema';
export {
  providerNameSchema,
  providerCredsSchema,
  budgetEnvelopeSchema,
  aiRuntimeConfigSchema,
  taskModelValueSchema,
  normalizeModelChain,
} from './shared/config.schema';

export { AI_ERROR_CODES } from './shared/error-codes';
export type { AiErrorCode } from './shared/error-codes';
