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
  AiTaskRouteStep,
  TaskRouteValue,
  AiExecutionProfile,
} from './shared/config.schema';
export {
  providerNameSchema,
  providerCredsSchema,
  budgetEnvelopeSchema,
  aiRuntimeConfigSchema,
  taskModelValueSchema,
  aiTaskRouteStepSchema,
  taskRouteValueSchema,
  aiExecutionProfileSchema,
  normalizeModelChain,
  normalizeTaskRoute,
  resolveActiveProfile,
} from './shared/config.schema';

export type {
  AiPromptPayload,
  StructuredOutputSpec,
  AiTaskRunInput,
  AiTaskAttemptTrace,
  AiTaskExecutionTrace,
  AiTaskRunResult,
  AiTaskStreamEvent,
} from './shared/task-runner.interface';
export {
  makeCorrelationId,
  renderPromptPayload,
} from './shared/task-runner.interface';
export type { AiRuntimeEnv } from './server/runtime-config';

export { AI_ERROR_CODES } from './shared/error-codes';
export type { AiErrorCode } from './shared/error-codes';
