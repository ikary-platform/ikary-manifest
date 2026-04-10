import { z } from 'zod';

export const PrimitivePropSchema: z.ZodType<PrimitiveProp> = z.lazy(() =>
  z.object({
    type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'function', 'ReactNode']),
    description: z.string().optional(),
    required: z.boolean().default(false),
    default: z.unknown().optional(),
    enum: z.array(z.string()).optional(),
    items: PrimitivePropSchema.optional(),
    properties: z.record(PrimitivePropSchema).optional(),
  }),
);

export type PrimitiveProp = {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function' | 'ReactNode';
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
  items?: PrimitiveProp;
  properties?: Record<string, PrimitiveProp>;
};

export const PrimitiveContractSchema = z.object({
  key: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semver (e.g. 1.0.0)'),
  label: z.string().min(1),
  description: z.string().optional(),
  category: z
    .enum(['data', 'form', 'layout', 'feedback', 'navigation', 'custom'])
    .default('custom'),
  breakingChanges: z.array(z.string()).default([]),
  props: z.object({
    type: z.literal('object'),
    properties: z.record(PrimitivePropSchema),
    required: z.array(z.string()).optional(),
  }),
});

export type PrimitiveContract = z.infer<typeof PrimitiveContractSchema>;
