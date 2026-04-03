import { z } from 'zod';

export const RoleDefinitionSchema = z
  .object({
    key: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    scopes: z
      .array(z.string().min(1))
      .min(1)
      .refine((values) => new Set(values).size === values.length, 'scopes must be unique'),
    identityMappings: z
      .array(z.string().min(1))
      .optional()
      .refine((values) => !values || new Set(values).size === values.length, 'identityMappings must be unique'),
  })
  .strict();

export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;
