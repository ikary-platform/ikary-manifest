import { isBrandingCustomized } from '../shared/cell-branding.defaults.js';
import type { CellBranding } from '../shared/cell-branding.schema.js';
import type { CellBrandingRow } from './cell-branding.repository.js';

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function mapCellBrandingRowToDto(row: CellBrandingRow): CellBranding {
  return {
    cellId: row.cell_id,
    version: row.version,
    accentColor: row.accent_color,
    titleFontFamily: row.title_font_family,
    bodyFontFamily: row.body_font_family,
    defaultThemeMode: row.default_theme_mode,
    isCustomized: isBrandingCustomized({
      accentColor: row.accent_color,
      titleFontFamily: row.title_font_family,
      bodyFontFamily: row.body_font_family,
      defaultThemeMode: row.default_theme_mode,
    }),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function buildDefaultCellBrandingDto(cellId: string): CellBranding {
  const now = new Date().toISOString();
  return {
    cellId,
    version: 0,
    accentColor: null,
    titleFontFamily: null,
    bodyFontFamily: null,
    defaultThemeMode: null,
    isCustomized: false,
    createdAt: now,
    updatedAt: now,
  };
}
