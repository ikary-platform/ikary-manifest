import { z } from 'zod';

export const DataGridRowActionIntentSchema = z.enum(['default', 'neutral', 'danger']);

export const DataGridRowActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    icon: z.string().min(1).optional(),
    intent: DataGridRowActionIntentSchema.optional(),

    /**
     * Stable runtime action reference.
     * Runtime decides how to execute it.
     */
    actionKey: z.string().min(1),

    /**
     * Optional UX hints.
     */
    requiresConfirmation: z.boolean().optional(),
    hiddenWhenUnauthorized: z.boolean().optional(),
  })
  .strict();

export type DataGridRowAction = z.infer<typeof DataGridRowActionSchema>;
