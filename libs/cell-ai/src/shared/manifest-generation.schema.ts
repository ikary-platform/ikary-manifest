import { z } from 'zod';

export const manifestGenerationInputSchema = z.object({
  userPrompt: z.string().min(1).max(4000),
  userContext: z
    .object({
      role: z.string().optional(),
      companySize: z.string().optional(),
    })
    .optional(),
});
export type ManifestGenerationInput = z.infer<typeof manifestGenerationInputSchema>;

export const manifestStreamEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('chunk'), delta: z.string() }),
  z.object({ type: z.literal('partial-manifest'), manifest: z.unknown() }),
  z.object({ type: z.literal('final-manifest'), manifest: z.unknown() }),
  z.object({
    type: z.literal('model-selected'),
    provider: z.string(),
    model: z.string(),
    attempt: z.number().int().positive(),
    chainLength: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('model-fallback'),
    reason: z.enum(['manifest_invalid', 'provider_error']),
    fromModel: z.string(),
    nextModel: z.string(),
  }),
  z.object({ type: z.literal('error'), code: z.string(), message: z.string() }),
  z.object({
    type: z.literal('done'),
    inputTokens: z.number(),
    outputTokens: z.number(),
    finalModel: z.string().optional(),
  }),
]);
export type ManifestStreamEvent = z.infer<typeof manifestStreamEventSchema>;
