import * as React from 'react';
import type { CellBranding } from '../../shared/cell-branding.schema.js';
import { useBrandingDataHooks } from '../hooks/branding-data-hooks.js';
import type { ThemeState } from '../theme/types.js';
import { ThemeProvider } from './ThemeProvider.js';

export interface CellBrandingProviderProps {
  cellId: string;
  children: React.ReactNode;
}

function toThemeState(branding: CellBranding | null): ThemeState | null {
  if (!branding) return null;
  return {
    accentColor: branding.accentColor,
    titleFontFamily: branding.titleFontFamily,
    bodyFontFamily: branding.bodyFontFamily,
    defaultThemeMode: branding.defaultThemeMode,
    isCustomized: branding.isCustomized,
  };
}

export function CellBrandingProvider({ cellId, children }: CellBrandingProviderProps) {
  const hooks = useBrandingDataHooks();
  const [branding] = hooks.useBranding(cellId);
  const theme = React.useMemo(() => toThemeState(branding), [branding]);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
