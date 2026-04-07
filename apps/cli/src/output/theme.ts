import chalk from 'chalk';

type ResolvedThemeMode = 'dark' | 'light';

const PALETTES: Record<ResolvedThemeMode, Record<string, string>> = {
  dark: {
    header: '#5a7afb',
    section: '#5a7afb',
    body: '#D1D5DB',
    success: '#86EFAC',
    error: '#FCA5A5',
    muted: '#9CA3AF',
    accent: '#3B82F6',
  },
  light: {
    header: '#1f2a5a',
    section: '#1D4ED8',
    body: '#334155',
    success: '#166534',
    error: '#DC2626',
    muted: '#64748B',
    accent: '#1D4ED8',
  },
};

let mode: ResolvedThemeMode = 'dark';

export const theme = {
  header: (s: string) => chalk.hex(PALETTES[mode].header)(s),
  section: (s: string) => chalk.hex(PALETTES[mode].section)(s),
  body: (s: string) => chalk.hex(PALETTES[mode].body)(s),
  success: (s: string) => chalk.hex(PALETTES[mode].success)(s),
  error: (s: string) => chalk.hex(PALETTES[mode].error)(s),
  muted: (s: string) => chalk.hex(PALETTES[mode].muted)(s),
  accent: (s: string) => chalk.hex(PALETTES[mode].accent)(s),
  bold: chalk.bold,
};

export function configureTheme(): void {
  const env = process.env.COLORFGBG;
  if (env) {
    const bg = Number.parseInt(env.split(';').pop() ?? '', 10);
    if (Number.isFinite(bg) && bg > 6) mode = 'light';
  }
  const override = process.env.IKARY_THEME?.toLowerCase();
  if (override === 'light') mode = 'light';
  if (override === 'dark') mode = 'dark';
}
