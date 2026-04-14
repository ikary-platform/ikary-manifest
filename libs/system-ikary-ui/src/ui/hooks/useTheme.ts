import { useCallback, useEffect, useState } from 'react';
export { THEME_PREFLIGHT_SCRIPT } from '../../shared/theme-preflight';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'ikary-theme';
const DARK_CLASS = 'dark';

function readInitial(): ThemeMode {
  if (typeof document === 'undefined') return 'light';
  if (document.documentElement.classList.contains(DARK_CLASS)) return 'dark';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function apply(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(DARK_CLASS, mode === 'dark');
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export interface UseThemeReturn {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export function useTheme(): UseThemeReturn {
  const [mode, setModeState] = useState<ThemeMode>(() => readInitial());

  useEffect(() => {
    apply(mode);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const toggle = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  return { mode, setMode, toggle };
}

