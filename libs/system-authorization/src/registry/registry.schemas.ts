import { z } from 'zod';

const optionalDescriptionSchema = z.string().trim().min(1).max(400).optional();

export const registerScopeSchema = z.object({
  code: z.string().trim().min(1).max(150),
  description: optionalDescriptionSchema,
});

export const setupAuthorizationSchema = z.object({
  features: z.array(z.string().trim().min(1).max(150)).default([]),
  domains: z.array(z.string().trim().min(1).max(150)).default([]),
});
