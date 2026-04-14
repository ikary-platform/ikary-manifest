import { z } from 'zod';
import { hexColorSchema, themeModeSchema } from './cell-branding.schema.js';

export const patchCellBrandingSchema = z.object({
  expectedVersion: z.number().int().nonnegative(),
  accentColor: hexColorSchema.nullable().optional(),
  titleFontFamily: z.string().min(1).max(255).nullable().optional(),
  bodyFontFamily: z.string().min(1).max(255).nullable().optional(),
  defaultThemeMode: themeModeSchema.nullable().optional(),
});

export type PatchCellBrandingInput = z.infer<typeof patchCellBrandingSchema>;

export const resetCellBrandingSchema = z.object({
  expectedVersion: z.number().int().nonnegative(),
});

export type ResetCellBrandingInput = z.infer<typeof resetCellBrandingSchema>;
