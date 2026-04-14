import type { Generated } from 'kysely';

export interface CellBrandingTable {
  cell_id: string;
  accent_color: string | null;
  title_font_family: string | null;
  body_font_family: string | null;
  default_theme_mode: 'light' | 'dark' | null;
  version: Generated<number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface CellBrandingDatabaseSchema {
  cell_branding: CellBrandingTable;
}
