import { z } from 'zod';

export const DashboardPageVariantSchema = z.enum(['workspace', 'cell', 'domain', 'entity-overview']);

export const DashboardPageDensitySchema = z.enum(['comfortable', 'compact']);

export const DashboardPageActionVariantSchema = z.enum(['default', 'secondary', 'destructive']);

export const DashboardWidgetSizeSchema = z.enum(['small', 'medium', 'large']);

export const DashboardPageRenderStateSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('loading'),
      state: z.unknown(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('error'),
      state: z.unknown(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('empty'),
      state: z.unknown(),
    })
    .strict(),
]);

export const DashboardWidgetRenderStateSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('loading'),
      state: z.unknown(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('empty'),
      state: z.unknown(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('error'),
      state: z.unknown(),
    })
    .strict(),
]);

export const DashboardPageActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    icon: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
    actionKey: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
    variant: DashboardPageActionVariantSchema.optional(),
  })
  .strict();

export const DashboardWidgetActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    icon: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
    actionKey: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
  })
  .strict();

export const DashboardWidgetRendererSchema = z
  .object({
    key: z.string().min(1),
  })
  .strict();

export const DashboardWidgetSchema = z
  .object({
    key: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    size: DashboardWidgetSizeSchema.optional(),
    renderer: DashboardWidgetRendererSchema,
    actions: z.array(DashboardWidgetActionSchema).optional(),
    renderState: DashboardWidgetRenderStateSchema.optional(),
  })
  .strict();

export const DashboardPagePresentationSchema = z
  .object({
    variant: DashboardPageVariantSchema.optional(),
    density: DashboardPageDensitySchema.optional(),
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    actions: z.array(DashboardPageActionSchema).optional(),
    kpis: z.array(DashboardWidgetSchema).optional(),
    primaryWidgets: z.array(DashboardWidgetSchema).optional(),
    secondaryWidgets: z.array(DashboardWidgetSchema).optional(),
    renderState: DashboardPageRenderStateSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.title.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['title'],
        message: 'title must not be blank',
      });
    }

    const pageActionKeys = (value.actions ?? []).map((action) => action.key);
    const duplicatePageActionKeys = pageActionKeys.filter((key, index) => pageActionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicatePageActionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actions'],
        message: `duplicate action key "${key}"`,
      });
    }

    const validateWidgetCollection = (
      path: 'kpis' | 'primaryWidgets' | 'secondaryWidgets',
      widgets: z.infer<typeof DashboardWidgetSchema>[],
    ) => {
      const widgetKeys = widgets.map((widget) => widget.key);
      const duplicateWidgetKeys = widgetKeys.filter((key, index) => widgetKeys.indexOf(key) !== index);

      for (const key of new Set(duplicateWidgetKeys)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [path],
          message: `duplicate widget key "${key}"`,
        });
      }
    };

    validateWidgetCollection('kpis', value.kpis ?? []);
    validateWidgetCollection('primaryWidgets', value.primaryWidgets ?? []);
    validateWidgetCollection('secondaryWidgets', value.secondaryWidgets ?? []);

    const globalWidgetKeys = [
      ...(value.kpis ?? []).map((widget) => widget.key),
      ...(value.primaryWidgets ?? []).map((widget) => widget.key),
      ...(value.secondaryWidgets ?? []).map((widget) => widget.key),
    ];
    const duplicateGlobalWidgetKeys = globalWidgetKeys.filter((key, index) => globalWidgetKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateGlobalWidgetKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kpis'],
        message: `widget key "${key}" must be unique across dashboard zones`,
      });
    }
  });

export type DashboardPagePresentation = z.infer<typeof DashboardPagePresentationSchema>;
export type DashboardPageVariant = z.infer<typeof DashboardPageVariantSchema>;
export type DashboardPageDensity = z.infer<typeof DashboardPageDensitySchema>;
export type DashboardPageActionVariant = z.infer<typeof DashboardPageActionVariantSchema>;
export type DashboardPageAction = z.infer<typeof DashboardPageActionSchema>;
export type DashboardWidgetSize = z.infer<typeof DashboardWidgetSizeSchema>;
export type DashboardWidgetAction = z.infer<typeof DashboardWidgetActionSchema>;
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;
export type DashboardPageRenderState = z.infer<typeof DashboardPageRenderStateSchema>;
export type DashboardWidgetRenderState = z.infer<typeof DashboardWidgetRenderStateSchema>;
