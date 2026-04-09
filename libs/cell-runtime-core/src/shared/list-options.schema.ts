import { z } from 'zod';

export const listOptionsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(200).optional().default(50),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  includeDeleted: z.boolean().optional().default(false),
});

/** Parsed (output) type — all fields are present with defaults applied. */
export type ListOptions = z.infer<typeof listOptionsSchema>;

/** Input type — all fields optional, used as function parameter type. */
export type ListOptionsInput = z.input<typeof listOptionsSchema>;

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
