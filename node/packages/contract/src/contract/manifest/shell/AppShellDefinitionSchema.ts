import { z } from 'zod';

export const AppShellLayoutModeSchema = z.enum([
  'sidebar-content',
  'topbar-content',
  'sidebar-topbar-content',
  'minimal',
]);

export const ShellRegionKeySchema = z.enum([
  'topbar',
  'sidebar',
  'main',
  'aside',
  'footer',
  'commandBar',
  'notifications',
]);

export const ShellRegionDefinitionSchema = z
  .object({
    key: ShellRegionKeySchema,
    enabled: z.boolean(),
    collapsible: z.boolean().optional(),
    defaultCollapsed: z.boolean().optional(),
    resizable: z.boolean().optional(),
    sticky: z.boolean().optional(),
    width: z.number().positive().optional(),
    minWidth: z.number().positive().optional(),
    maxWidth: z.number().positive().optional(),
    order: z.number().int().optional(),
  })
  .strict();

export const ShellNavItemDefinitionSchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      key: z.string().min(1),
      label: z.string().min(1),
      icon: z.string().min(1).optional(),
      href: z.string().min(1).optional(),
      children: z.array(ShellNavItemDefinitionSchema).optional(),
      capabilityKey: z.string().min(1).optional(),
      external: z.boolean().optional(),
    })
    .strict(),
);

export const ShellNavigationDefinitionSchema = z
  .object({
    primary: z.array(ShellNavItemDefinitionSchema).optional(),
    secondary: z.array(ShellNavItemDefinitionSchema).optional(),
    footer: z.array(ShellNavItemDefinitionSchema).optional(),
  })
  .strict();

export const ShellCapabilitiesSchema = z
  .object({
    globalSearch: z.boolean().optional(),
    workspaceSwitcher: z.boolean().optional(),
    tenantSwitcher: z.boolean().optional(),
    commandPalette: z.boolean().optional(),
    notifications: z.boolean().optional(),
    breadcrumbs: z.boolean().optional(),
    userMenu: z.boolean().optional(),
    themeSwitcher: z.boolean().optional(),
  })
  .strict();

export const ShellResponsiveDefinitionSchema = z
  .object({
    mobileBreakpoint: z.number().positive().optional(),
    collapseSidebarBelow: z.number().positive().optional(),
    collapseAsideBelow: z.number().positive().optional(),
    hideLabelsBelow: z.number().positive().optional(),
    overlaySidebarOnMobile: z.boolean().optional(),
  })
  .strict();

export const AppShellDefinitionSchema = z
  .object({
    key: z.string().min(1),
    name: z.string().min(1),

    layout: z
      .object({
        mode: AppShellLayoutModeSchema,
        maxContentWidth: z.union([z.number().positive(), z.literal('full')]).optional(),
        contentPadding: z.enum(['none', 'sm', 'md', 'lg']).optional(),
      })
      .strict(),

    branding: z
      .object({
        logo: z.string().min(1).optional(),
        productName: z.string().min(1).optional(),
        showProductName: z.boolean().optional(),
      })
      .strict()
      .optional(),

    regions: z.array(ShellRegionDefinitionSchema).min(1),

    navigation: ShellNavigationDefinitionSchema.optional(),

    capabilities: ShellCapabilitiesSchema.optional(),

    responsive: ShellResponsiveDefinitionSchema.optional(),

    outlet: z
      .object({
        type: z.literal('page'),
        region: z.literal('main'),
      })
      .strict(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const mainRegions = value.regions.filter((r) => r.key === 'main');

    if (mainRegions.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['regions'],
        message: 'there must be exactly one "main" region',
      });
    }

    const main = mainRegions[0];
    if (main && !main.enabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['regions'],
        message: '"main" region must be enabled',
      });
    }

    const regionKeys = value.regions.map((r) => r.key);
    if (new Set(regionKeys).size !== regionKeys.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['regions'],
        message: 'region keys must be unique',
      });
    }
  });

export type AppShellDefinition = z.infer<typeof AppShellDefinitionSchema>;
