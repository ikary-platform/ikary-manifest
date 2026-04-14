import type { CellBranding } from './cell-branding.schema.js';

export const SYSTEM_DEFAULT_BRANDING = {
  accentColor: null,
  titleFontFamily: null,
  bodyFontFamily: null,
  defaultThemeMode: null,
  isCustomized: false,
} as const satisfies Pick<
  CellBranding,
  'accentColor' | 'titleFontFamily' | 'bodyFontFamily' | 'defaultThemeMode' | 'isCustomized'
>;

export function isBrandingCustomized(
  fields: Pick<
    CellBranding,
    'accentColor' | 'titleFontFamily' | 'bodyFontFamily' | 'defaultThemeMode'
  >,
): boolean {
  return (
    fields.accentColor !== null ||
    fields.titleFontFamily !== null ||
    fields.bodyFontFamily !== null ||
    fields.defaultThemeMode !== null
  );
}
