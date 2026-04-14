import { z } from 'zod';

export const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: 'accentColor must be a 6-digit hex value like #2563EB',
});

export const themeModeSchema = z.enum(['light', 'dark']);
export type ThemeMode = z.infer<typeof themeModeSchema>;

export const cellBrandingSchema = z.object({
  cellId: z.string().min(1),
  version: z.number().int().nonnegative(),
  accentColor: hexColorSchema.nullable(),
  titleFontFamily: z.string().min(1).max(255).nullable(),
  bodyFontFamily: z.string().min(1).max(255).nullable(),
  defaultThemeMode: themeModeSchema.nullable(),
  isCustomized: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CellBranding = z.infer<typeof cellBrandingSchema>;
