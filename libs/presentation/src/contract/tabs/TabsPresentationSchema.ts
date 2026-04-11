import { z } from 'zod';

export const TabsOverflowModeSchema = z.enum(['scroll', 'menu']);

export const TabsResponsiveBreakpointSchema = z.enum(['sm', 'md', 'lg']);

export const TabsVariantSchema = z.enum(['line', 'pill']);
export type TabsVariant = z.infer<typeof TabsVariantSchema>;

export const TabsItemSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),

    /**
     * Declarative navigation target.
     * Use href for direct navigation.
     */
    href: z.string().min(1).optional(),

    /**
     * Declarative runtime action target.
     * Use actionKey when runtime resolves navigation/action behavior.
     */
    actionKey: z.string().min(1).optional(),

    /**
     * Optional compact count surface.
     */
    count: z.number().int().min(0).optional(),

    disabled: z.boolean().optional(),
    hiddenWhenUnauthorized: z.boolean().optional(),
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
        message: 'href and actionKey cannot both be set at the same time',
      });
    }
  });

export const TabsOverflowSchema = z
  .object({
    mode: TabsOverflowModeSchema.optional(),
    collapseBelow: TabsResponsiveBreakpointSchema.optional(),
  })
  .strict();

export const TabsPresentationSchema = z
  .object({
    type: z.literal('tabs'),

    items: z.array(TabsItemSchema).min(1).describe('Tab items to display. Each requires key, label, and href or actionKey.'),

    /**
     * Optional active item key.
     * Runtime may also control active state.
     */
    activeKey: z.string().min(1).optional().describe('Key of the currently active tab. Runtime can control this instead.'),

    overflow: TabsOverflowSchema.optional().describe('How to handle overflow when tabs exceed container width.'),

    dense: z.boolean().optional().describe('Compact height variant — h-8 (dense) vs h-9 (default).'),

    variant: TabsVariantSchema.optional().describe('Visual style: "line" (underline border, default) or "pill" (segmented button).'),
  })
  .strict()
  .superRefine((value, ctx) => {
    const itemKeys = value.items.map((item) => item.key);
    const duplicateItemKeys = itemKeys.filter((key, index) => itemKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateItemKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: `duplicate tab key "${key}"`,
      });
    }

    if (value.activeKey && !value.items.some((item) => item.key === value.activeKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['activeKey'],
        message: `activeKey "${value.activeKey}" does not reference a declared tab item`,
      });
    }
  });

export type TabsPresentation = z.infer<typeof TabsPresentationSchema>;
export type TabsItem = z.infer<typeof TabsItemSchema>;
export type TabsOverflowMode = z.infer<typeof TabsOverflowModeSchema>;
