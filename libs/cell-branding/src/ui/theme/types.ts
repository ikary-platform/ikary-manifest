import type { ThemeMode } from '../../shared/cell-branding.schema.js';

export interface ThemeState {
  accentColor: string | null;
  titleFontFamily: string | null;
  bodyFontFamily: string | null;
  defaultThemeMode: ThemeMode | null;
  isCustomized: boolean;
}
