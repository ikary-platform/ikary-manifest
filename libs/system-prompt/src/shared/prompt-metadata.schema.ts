import { z } from 'zod';

export const promptArgumentSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9_]*$/, {
    message: 'Argument name must be snake_case starting with a letter.',
  }),
  description: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  required: z.boolean().default(true),
  source: z.enum(['user', 'system']).default('system'),
  maxBytes: z.number().int().positive().optional(),
  example: z.unknown().optional(),
});

export const promptMetadataSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/, {
    message: 'Prompt name must be "<scope>/<id>" using lowercase letters, digits, and dashes.',
  }),
  description: z.string().min(1),
  usage: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: 'Version must follow semver MAJOR.MINOR.PATCH.',
  }),
  arguments: z.array(promptArgumentSchema).default([]),
});

export type PromptArgument = z.infer<typeof promptArgumentSchema>;
export type PromptMetadata = z.infer<typeof promptMetadataSchema>;

export const DEFAULT_USER_ARG_MAX_BYTES = 8000;
