import { z } from 'zod';

export const CapabilityInputTypeSchema = z.enum(['string', 'text', 'number', 'boolean', 'date', 'select', 'entity']);

export type CapabilityInputType = z.infer<typeof CapabilityInputTypeSchema>;
