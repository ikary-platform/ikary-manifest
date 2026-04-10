import React from 'react';
import { ChevronDown } from 'lucide-react';
import { LOG_ENTRY_LEVELS, type LogEntryLevel } from '../shared/log-level.schema';
import { LEVEL_COLORS } from './level-colors';
import { messages } from './locales/en';

function t(key: keyof typeof messages, args?: Record<string, string | number>): string {
  let msg = messages[key] as string;
  if (args) {
    for (const [k, v] of Object.entries(args)) {
      msg = msg.replace(`{${k}}`, String(v));
    }
  }
  return msg;
}

interface LogLevelFilterProps {
  selectedLevels: LogEntryLevel[];
  onLevelsChange: (levels: LogEntryLevel[]) => void;
}

export function LogLevelFilter({ selectedLevels, onLevelsChange }: LogLevelFilterProps) {
  const allSelected = selectedLevels.length === 0;
  const label = allSelected
    ? t('system_log.filter.all_levels')
    : t('system_log.filter.levels_selected', { count: selectedLevels.length });

  function toggleLevel(level: LogEntryLevel) {
    if (selectedLevels.includes(level)) {
      onLevelsChange(selectedLevels.filter((l) => l !== level));
    } else {
      onLevelsChange([...selectedLevels, level]);
    }
  }

  return (
    <details className="relative" style={{ listStyle: 'none' }}>
      <summary
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
        style={{ color: 'var(--ux-terminal-muted)', listStyle: 'none' }}
      >
        {label}
        <ChevronDown className="size-3" />
      </summary>
      <div
        className="absolute right-0 z-10 mt-1 w-40 rounded-md border shadow-md"
        style={{ backgroundColor: 'var(--ux-terminal-bg)', borderColor: 'var(--ux-terminal-border)' }}
      >
        <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-accent">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onLevelsChange([])}
            className="size-3"
          />
          {t('system_log.filter.all_levels')}
        </label>
        <hr style={{ borderColor: 'var(--ux-terminal-border)' }} />
        {LOG_ENTRY_LEVELS.map((level) => (
          <label key={level} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-accent">
            <input
              type="checkbox"
              checked={selectedLevels.includes(level)}
              onChange={() => toggleLevel(level)}
              className="size-3"
            />
            <span
              className="inline-block size-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: LEVEL_COLORS[level] }}
            />
            {t(`system_log.filter.level_${level}` as keyof typeof messages)}
          </label>
        ))}
      </div>
    </details>
  );
}
