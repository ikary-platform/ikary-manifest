import { z } from 'zod';

export const DisplayTypeSchema = z.enum([
  'text',
  'multiline-text',
  'number',
  'currency',
  'percentage',
  'date',
  'datetime',
  'boolean',
  'status',
  'badge',
  'email',
  'phone',
  'url',
  'entity-link',
  'user',
  'avatar-name',
  'tags',
  'progress',
  'json-preview',
  'actions',
  'custom',
]);

export const DisplayAlignSchema = z.enum(['left', 'center', 'right']);

export const DisplayDefinitionSchema = z
  .object({
    type: DisplayTypeSchema,

    // Common display options
    emptyLabel: z.string().optional(),
    truncate: z.boolean().optional(),
    tooltip: z.boolean().optional(),
    align: DisplayAlignSchema.optional(),

    // Numeric formatting
    currency: z.string().min(1).optional(),
    precision: z.number().int().min(0).max(6).optional(),

    // Relation / identity display
    labelField: z.string().min(1).optional(),
    subtitleField: z.string().min(1).optional(),
    route: z.string().min(1).optional(),

    // Status / badge mapping
    badgeToneMap: z.record(z.string()).optional(),
    statusMap: z.record(z.string()).optional(),

    // Collection-like display
    maxItems: z.number().int().positive().optional(),
    showOverflowCount: z.boolean().optional(),

    // Escape hatch
    rendererKey: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    // currency only valid for currency display
    if (value.currency && value.type !== 'currency') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currency'],
        message: 'currency is only allowed when display.type === "currency"',
      });
    }

    // precision only makes sense for numeric-like displays
    if (value.precision !== undefined && !['number', 'currency', 'percentage', 'progress'].includes(value.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['precision'],
        message: 'precision is only allowed for number, currency, percentage, or progress display types',
      });
    }

    // label/subtitle/route only make sense for identity-like renderers
    if (value.labelField && !['entity-link', 'user', 'avatar-name'].includes(value.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['labelField'],
        message: 'labelField is only allowed for entity-link, user, or avatar-name display types',
      });
    }

    if (value.subtitleField && !['entity-link', 'user', 'avatar-name'].includes(value.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['subtitleField'],
        message: 'subtitleField is only allowed for entity-link, user, or avatar-name display types',
      });
    }

    if (value.route && !['entity-link', 'url', 'email', 'phone'].includes(value.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['route'],
        message: 'route is only allowed for entity-link, url, email, or phone display types',
      });
    }

    // status / badge maps
    if (value.statusMap && value.type !== 'status') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['statusMap'],
        message: 'statusMap is only allowed when display.type === "status"',
      });
    }

    if (value.badgeToneMap && value.type !== 'badge') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['badgeToneMap'],
        message: 'badgeToneMap is only allowed when display.type === "badge"',
      });
    }

    // tag-specific config
    if (value.maxItems !== undefined && !['tags', 'json-preview'].includes(value.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxItems'],
        message: 'maxItems is only allowed for tags or json-preview display types',
      });
    }

    if (value.showOverflowCount !== undefined && value.type !== 'tags') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['showOverflowCount'],
        message: 'showOverflowCount is only allowed when display.type === "tags"',
      });
    }

    // custom renderer requires rendererKey
    if (value.type === 'custom' && !value.rendererKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rendererKey'],
        message: 'rendererKey is required when display.type === "custom"',
      });
    }

    if (value.type !== 'custom' && value.rendererKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rendererKey'],
        message: 'rendererKey is only allowed when display.type === "custom"',
      });
    }
  });

export type DisplayDefinition = z.infer<typeof DisplayDefinitionSchema>;
