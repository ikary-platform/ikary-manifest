import { z } from 'zod';

export const FieldValueTypeSchema = z.enum([
  'text',
  'number',
  'currency',
  'date',
  'datetime',
  'boolean',
  'badge',
  'status',
  'enum',
  'link',
]);

export const FieldValueToneSchema = z.enum(['neutral', 'info', 'success', 'warning', 'danger']);

export const FieldValueDateStyleSchema = z.enum(['short', 'medium', 'long']);

export const FieldValueLinkTargetSchema = z.enum(['internal', 'external']);

export const FieldValueFormatSchema = z
  .object({
    currency: z.string().min(3).max(3).optional(),
    dateStyle: FieldValueDateStyleSchema.optional(),
    datetimeStyle: FieldValueDateStyleSchema.optional(),
  })
  .strict();

export const FieldValuePresentationSchema = z
  .object({
    type: z.literal('field-value'),

    valueType: FieldValueTypeSchema,

    /**
     * Optional custom label for empty values.
     * Defaults at runtime to a canonical empty marker such as "—".
     */
    emptyLabel: z.string().min(1).optional(),

    /**
     * Optional semantic tone used mainly for badge/status/enum displays.
     */
    tone: FieldValueToneSchema.optional(),

    /**
     * Optional formatting hints.
     * Runtime owns actual formatting behavior.
     */
    format: FieldValueFormatSchema.optional(),

    /**
     * Optional declarative link hint.
     * Only valid when valueType = "link".
     */
    link: z
      .object({
        target: FieldValueLinkTargetSchema.optional(),
      })
      .strict()
      .optional(),

    /**
     * Optional display hints.
     */
    truncate: z.boolean().optional(),
    tooltip: z.boolean().optional(),
    dense: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const toneTypes = new Set(['badge', 'status', 'enum']);
    if (value.tone && !toneTypes.has(value.valueType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tone'],
        message: 'tone is only allowed for badge, status, or enum value types',
      });
    }

    if (value.link && value.valueType !== 'link') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['link'],
        message: 'link config is only allowed when valueType is "link"',
      });
    }

    if (value.valueType === 'link' && value.link === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['link'],
        message: 'link config is required when valueType is "link"',
      });
    }

    if (value.format?.currency && value.valueType !== 'currency') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['format', 'currency'],
        message: 'format.currency is only allowed when valueType is "currency"',
      });
    }

    if (value.format?.dateStyle && value.valueType !== 'date') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['format', 'dateStyle'],
        message: 'format.dateStyle is only allowed when valueType is "date"',
      });
    }

    if (value.format?.datetimeStyle && value.valueType !== 'datetime') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['format', 'datetimeStyle'],
        message: 'format.datetimeStyle is only allowed when valueType is "datetime"',
      });
    }
  });

export type FieldValuePresentation = z.infer<typeof FieldValuePresentationSchema>;
export type FieldValueType = z.infer<typeof FieldValueTypeSchema>;
export type FieldValueTone = z.infer<typeof FieldValueToneSchema>;
