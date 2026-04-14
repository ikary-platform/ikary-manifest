import { z } from 'zod';
import { cellBrandingSchema } from './cell-branding.schema.js';

export const cellBrandingItemResponseSchema = z.object({
  data: cellBrandingSchema,
});

export type CellBrandingItemResponse = z.infer<typeof cellBrandingItemResponseSchema>;

export const cellBrandingMutationResponseSchema = z.object({
  data: cellBrandingSchema,
});

export type CellBrandingMutationResponse = z.infer<typeof cellBrandingMutationResponseSchema>;
