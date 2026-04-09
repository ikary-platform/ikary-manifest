import { z } from 'zod';

export const fieldTypeSchema = z.enum([
  'string',
  'text',
  'number',
  'boolean',
  'date',
  'datetime',
  'enum',
  'object',
]);
export type FieldType = z.infer<typeof fieldTypeSchema>;
