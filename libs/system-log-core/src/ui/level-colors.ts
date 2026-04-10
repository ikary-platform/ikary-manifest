import type { LogEntryLevel } from '../shared/log-level.schema';

export const LEVEL_COLORS: Record<LogEntryLevel, string> = {
  trace: 'var(--ux-terminal-log-trace)',
  debug: 'var(--ux-terminal-log-debug)',
  info: 'var(--ux-terminal-log-info)',
  warn: 'var(--ux-terminal-log-warn)',
  error: 'var(--ux-terminal-log-error)',
  fatal: 'var(--ux-terminal-log-fatal)',
};
