import * as React from 'react';
import { applyTheme } from '../theme/applyTheme.js';
import type { ThemeState } from '../theme/types.js';
import { useOptionalThemeMode } from './ThemeModeProvider.js';

const ThemeContext = React.createContext<ThemeState | null>(null);

export interface ThemeProviderProps {
  theme: ThemeState | null;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const themeMode = useOptionalThemeMode();
  const defaultMode = theme?.defaultThemeMode ?? null;

  React.useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    if (!themeMode) return;
    themeMode.setDefaultMode(defaultMode);
    return () => {
      themeMode.setDefaultMode(null);
    };
  }, [defaultMode, themeMode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState | null {
  return React.useContext(ThemeContext);
}
