import { z } from 'zod';

export const PrimitiveSourceEntrySchema = z.object({
  key: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semver (e.g. 1.0.0)'),
  source: z.string().min(1),
  contract: z.string().min(1),
  examples: z.string().optional(),
  overrides: z.string().optional(),
  entityBinding: z.union([z.string(), z.array(z.string())]).optional(),
});

export type PrimitiveSourceEntry = z.infer<typeof PrimitiveSourceEntrySchema>;

export const IkaryPrimitivesConfigSchema = z.object({
  apiVersion: z.literal('ikary.co/v1alpha1'),
  kind: z.literal('PrimitiveConfig'),
  primitives: z.array(PrimitiveSourceEntrySchema),
});

export type IkaryPrimitivesConfig = z.infer<typeof IkaryPrimitivesConfigSchema>;
