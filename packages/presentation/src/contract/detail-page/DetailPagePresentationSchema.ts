import { z } from 'zod';

export const DetailPageTabKindSchema = z.enum(['overview', 'domain', 'history', 'audit']);

export const DetailPageMetadataKeySchema = z.enum([
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
  'version',
  'status',
]);

export const DetailPageActionVariantSchema = z.enum(['default', 'secondary', 'destructive']);

export const DetailPageTabSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    href: z.string().min(1),
    disabled: z.boolean().optional(),
    kind: DetailPageTabKindSchema.optional(),
  })
  .strict();

export const DetailPageMetadataItemSchema = z
  .object({
    key: DetailPageMetadataKeySchema,
    label: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

export const DetailPageActionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    icon: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
    actionKey: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
    variant: DetailPageActionVariantSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.href && !value.actionKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actionKey'],
        message: 'href or actionKey is required',
      });
    }

    if (value.href && value.actionKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['href'],
        message: 'href and actionKey cannot both be set',
      });
    }
  });

export const DetailPageRenderStateSchema = z.discriminatedUnion('kind', [
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
]);

export const DetailPagePresentationSchema = z
  .object({
    title: z.string().min(1),
    metadata: z.array(DetailPageMetadataItemSchema).min(1),
    actions: z.array(DetailPageActionSchema).optional(),
    tabs: z.array(DetailPageTabSchema).min(1),
    activeTabKey: z.string().min(1),
    overviewEditable: z.boolean().optional(),
    isEditing: z.boolean().optional(),
    content: z
      .object({
        key: z.string().min(1),
      })
      .strict(),
    renderState: DetailPageRenderStateSchema.optional(),
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

    const metadataKeys = value.metadata.map((item) => item.key);
    const duplicateMetadataKeys = metadataKeys.filter((key, index) => metadataKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateMetadataKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata'],
        message: `duplicate metadata key "${key}"`,
      });
    }

    const requiredMetadataKeys: Array<z.infer<typeof DetailPageMetadataKeySchema>> = [
      'createdAt',
      'createdBy',
      'updatedAt',
      'updatedBy',
      'version',
    ];

    for (const key of requiredMetadataKeys) {
      if (!metadataKeys.includes(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['metadata'],
          message: `metadata must include "${key}"`,
        });
      }
    }

    const tabKeys = value.tabs.map((tab) => tab.key);
    const duplicateTabKeys = tabKeys.filter((key, index) => tabKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateTabKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: `duplicate tab key "${key}"`,
      });
    }

    if (!tabKeys.includes(value.activeTabKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['activeTabKey'],
        message: `activeTabKey "${value.activeTabKey}" does not reference a declared tab`,
      });
    }

    const inferredKinds = value.tabs.map((tab) => inferTabKind(tab));
    const overviewIndex = inferredKinds.indexOf('overview');
    const historyIndex = inferredKinds.indexOf('history');
    const auditIndex = inferredKinds.indexOf('audit');

    if (overviewIndex === -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: 'tabs must include an overview tab',
      });
    } else if (overviewIndex !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: 'overview tab must be first',
      });
    }

    if (historyIndex === -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: 'tabs must include a history tab',
      });
    }

    if (auditIndex === -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: 'tabs must include an audit tab',
      });
    }

    if (historyIndex !== -1 && auditIndex !== -1 && historyIndex > auditIndex) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: 'history tab must appear before audit tab',
      });
    }

    if (historyIndex !== -1 && historyIndex < value.tabs.length - 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: 'history tab must be in the governance tab region at the end',
      });
    }

    if (auditIndex !== -1 && auditIndex !== value.tabs.length - 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tabs'],
        message: 'audit tab must be last',
      });
    }

    const actionKeys = (value.actions ?? []).map((action) => action.key);
    const duplicateActionKeys = actionKeys.filter((key, index) => actionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateActionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actions'],
        message: `duplicate action key "${key}"`,
      });
    }

    if (value.isEditing && !value.overviewEditable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['isEditing'],
        message: 'isEditing=true requires overviewEditable=true',
      });
    }

    if (value.isEditing) {
      const activeTab = value.tabs.find((tab) => tab.key === value.activeTabKey);
      if (activeTab && inferTabKind(activeTab) !== 'overview') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['isEditing'],
          message: 'edit mode is only valid when the active tab is overview',
        });
      }
    }
  });

export type DetailPagePresentation = z.infer<typeof DetailPagePresentationSchema>;
export type DetailPageTab = z.infer<typeof DetailPageTabSchema>;
export type DetailPageMetadataItem = z.infer<typeof DetailPageMetadataItemSchema>;
export type DetailPageAction = z.infer<typeof DetailPageActionSchema>;
export type DetailPageRenderState = z.infer<typeof DetailPageRenderStateSchema>;

function inferTabKind(tab: z.infer<typeof DetailPageTabSchema>) {
  if (tab.kind) {
    return tab.kind;
  }

  if (tab.key === 'overview') {
    return 'overview' as const;
  }

  if (tab.key === 'history') {
    return 'history' as const;
  }

  if (tab.key === 'audit' || tab.key === 'audit-log') {
    return 'audit' as const;
  }

  return 'domain' as const;
}
