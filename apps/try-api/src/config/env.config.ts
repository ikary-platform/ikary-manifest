import { z } from 'zod';
import type { AiRuntimeConfig } from '@ikary/system-ai';
import {
  buildAiRuntimeConfig,
  redactAiRuntimeConfig,
  aiRuntimeEnvSchema,
  type AiRuntimeEnv,
} from '@ikary/system-ai/server';

const envSchema = aiRuntimeEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(4510),
  NODE_ENV: z.string().default('development'),
  EXAMPLES_DIR: z.string().optional(),
  PROMPTS_DIR: z.string().optional(),
});

export type ParsedEnv = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): ParsedEnv {
  return envSchema.parse(source);
}

export function buildTryApiAiRuntimeConfig(env: ParsedEnv): AiRuntimeConfig {
  return buildAiRuntimeConfig(env as AiRuntimeEnv);
}

export function logResolvedConfig(env: ParsedEnv, config: AiRuntimeConfig): void {
  // eslint-disable-next-line no-console
  console.log('[try-api] resolved config', {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    ...redactAiRuntimeConfig(config),
  });
}
