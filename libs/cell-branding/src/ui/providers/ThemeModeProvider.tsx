import * as React from 'react';
import { z } from 'zod';
import { themeModeSchema, type ThemeMode } from '../../shared/cell-branding.schema.js';

const storedThemeModeSchema = z.object({
  mode: themeModeSchema,
  updatedAt: z.string().datetime(),
});

const THEME_STORAGE_KEY = 'ikary.theme.mode';

interface ThemeModeContextValue {
  defaultMode: ThemeMode | null;
  mode: ThemeMode;
  userMode: ThemeMode | null;
  setDefaultMode: (mode: ThemeMode | null) => void;
  setMode: (mode: ThemeMode) => void;
  clearMode: () => void;
  toggleMode: () => void;
}

const ThemeModeContext = React.createContext<ThemeModeContextValue | null>(null);

function readUserMode(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (!raw) return null;
  try {
    return storedThemeModeSchema.parse(JSON.parse(raw)).mode;
  } catch {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    return null;
  }
}

function writeUserMode(mode: ThemeMode | null): void {
  if (typeof window === 'undefined') return;
  if (!mode) {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(
    THEME_STORAGE_KEY,
    JSON.stringify({ mode, updatedAt: new Date().toISOString() }),
  );
}

function applyMode(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.dataset['theme'] = mode;
  root.style.colorScheme = mode;
}

export function initializeThemeMode(fallbackMode: ThemeMode = 'light'): ThemeMode {
  const initial = readUserMode() ?? fallbackMode;
  applyMode(initial);
  return initial;
}

export interface ThemeModeProviderProps {
  children: React.ReactNode;
  fallbackMode?: ThemeMode;
}

export function ThemeModeProvider({ children, fallbackMode = 'light' }: ThemeModeProviderProps) {
  const [userMode, setUserMode] = React.useState<ThemeMode | null>(() => readUserMode());
  const [defaultMode, setDefaultMode] = React.useState<ThemeMode | null>(null);

  const mode: ThemeMode = userMode ?? defaultMode ?? fallbackMode;

  React.useLayoutEffect(() => {
    applyMode(mode);
  }, [mode]);

  const value = React.useMemo<ThemeModeContextValue>(
    () => ({
      defaultMode,
      mode,
      userMode,
      setDefaultMode,
      setMode: (next: ThemeMode) => {
        writeUserMode(next);
        setUserMode(next);
      },
      clearMode: () => {
        writeUserMode(null);
        setUserMode(null);
      },
      toggleMode: () => {
        const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
        writeUserMode(next);
        setUserMode(next);
      },
    }),
    [defaultMode, mode, userMode],
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeContextValue {
  const value = React.useContext(ThemeModeContext);
  if (!value) throw new Error('useThemeMode must be used inside a ThemeModeProvider.');
  return value;
}

export function useOptionalThemeMode(): ThemeModeContextValue | null {
  return React.useContext(ThemeModeContext);
}
