import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { LogLevelFilter } from './LogLevelFilter';
import type { LogEntryLevel } from '../shared/log-level.schema';
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

interface LogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedLevels: LogEntryLevel[];
  onLevelsChange: (levels: LogEntryLevel[]) => void;
  onDownload: () => void;
  isLoading: boolean;
  totalLoaded: number;
}

export function LogToolbar({
  search,
  onSearchChange,
  selectedLevels,
  onLevelsChange,
  onDownload,
  isLoading,
  totalLoaded,
}: LogToolbarProps) {
  const [inputValue, setInputValue] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    },
    [onSearchChange],
  );

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="relative">
        <input
          type="search"
          className="h-7 w-48 rounded-md border bg-transparent px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          style={{ borderColor: 'var(--ux-terminal-border)', color: 'var(--ux-terminal-fg)' }}
          placeholder={t('system_log.toolbar.search_placeholder')}
          aria-label={t('system_log.toolbar.search_aria')}
          value={inputValue}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      <div className="flex-1" />
      <LogLevelFilter selectedLevels={selectedLevels} onLevelsChange={onLevelsChange} />
      <span className="tabular-nums" style={{ color: 'var(--ux-terminal-muted)' }}>
        {t('system_log.toolbar.log_count', { count: totalLoaded.toLocaleString() })}
      </span>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        style={{ color: 'var(--ux-terminal-muted)' }}
        onClick={onDownload}
        aria-label={t('system_log.toolbar.download_aria')}
        disabled={totalLoaded === 0}
      >
        <Download className="size-3.5" />
      </button>
    </div>
  );
}
