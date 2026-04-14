import { z } from 'zod';

export const CELL_BRANDING_MODULE_OPTIONS = Symbol.for('ikary.cell-branding.module-options');
export const CELL_BRANDING_DATABASE = Symbol.for('ikary.cell-branding.database');

export const cellBrandingModuleOptionsSchema = z.object({
  databaseProviderToken: z.any(),
  packageName: z.string().default('@ikary/cell-branding'),
  packageVersion: z.string(),
  routePrefix: z.string().min(1).default('cells'),
});

export type CellBrandingModuleOptions = z.infer<typeof cellBrandingModuleOptionsSchema>;
