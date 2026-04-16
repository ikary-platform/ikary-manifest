import { z } from 'zod';
import {
  buildAiRuntimeConfigFromEnv,
  redactAiRuntimeConfig,
  aiRuntimeEnvSchema,
  type AiRuntimeConfig,
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

export function buildAiRuntimeConfig(env: ParsedEnv): AiRuntimeConfig {
  return buildAiRuntimeConfigFromEnv(env as NodeJS.ProcessEnv & AiRuntimeEnv);
}

export function logResolvedConfig(env: ParsedEnv, config: AiRuntimeConfig): void {
  // eslint-disable-next-line no-console
  console.log('[try-api] resolved config', {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    ...redactAiRuntimeConfig(config),
  });
}
