import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TerminalShell } from './TerminalShell';
import { TerminalLogLine, formatTimestamp, formatLevel } from './TerminalLogLine';
import { LogToolbar } from './LogToolbar';
import { useLogStream } from './useLogStream';
import type { LogStreamFetchParams, LogStreamFetchResult } from './useLogStream';
import type { LogEntryLevel } from '../shared/log-level.schema';
import type { PlatformLogEntry } from '../shared/log-entry.schema';
import { messages } from './locales/en';

function t(key: keyof typeof messages): string {
  return messages[key] as string;
}

export interface TerminalLogViewerProps {
  fetchLogs: (params: LogStreamFetchParams) => Promise<LogStreamFetchResult>;
  pageSize?: number;
  className?: string;
}

function formatLogLine(entry: PlatformLogEntry): string {
  const ts = formatTimestamp(entry.loggedAt);
  const level = formatLevel(entry.level);
  const svc = entry.service ? `[${entry.service}]` : '';
  const op = entry.operation || '';
  return `[${ts}] ${level} ${svc} ${op} — ${entry.message}`;
}

export function TerminalLogViewer({ fetchLogs, pageSize = 1000, className }: TerminalLogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [levels, setLevels] = useState<LogEntryLevel[]>([]);
  const hasScrolledInitialRef = useRef(false);
  const prevEntryCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);

  const { entries, isLoading, isLoadingOlder, hasOlder, loadOlder } = useLogStream({
    fetchLogs,
    pageSize,
    levels,
    search,
  });

  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 24,
    overscan: 10,
  });

  useEffect(() => {
    if (!isLoading && entries.length > 0 && !hasScrolledInitialRef.current) {
      hasScrolledInitialRef.current = true;
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  }, [isLoading, entries.length]);

  useEffect(() => {
    hasScrolledInitialRef.current = false;
  }, [search, levels]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const prevCount = prevEntryCountRef.current;
    const currentCount = entries.length;

    if (currentCount > prevCount && prevCount > 0 && hasScrolledInitialRef.current) {
      const newScrollHeight = el.scrollHeight;
      const delta = newScrollHeight - prevScrollHeightRef.current;
      if (delta > 0) el.scrollTop += delta;
    }

    prevEntryCountRef.current = currentCount;
    prevScrollHeightRef.current = el.scrollHeight;
  }, [entries.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isLoadingOlder || !hasOlder) return;
    if (el.scrollTop < 200) {
      prevScrollHeightRef.current = el.scrollHeight;
      void loadOlder();
    }
  }, [isLoadingOlder, hasOlder, loadOlder]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleDownload = useCallback(() => {
    const text = entries.map(formatLogLine).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const toolbar = (
    <LogToolbar
      search={search}
      onSearchChange={setSearch}
      selectedLevels={levels}
      onLevelsChange={setLevels}
      onDownload={handleDownload}
      isLoading={isLoading}
      totalLoaded={entries.length}
    />
  );

  return (
    <TerminalShell className={className} scrollRef={scrollRef} bottomBar={toolbar}>
      {isLoadingOlder && (
        <div className="flex items-center justify-center py-2 text-xs" style={{ color: 'var(--ux-terminal-muted)' }}>
          <span className="inline-flex h-3 w-3 animate-spin rounded-full border border-current border-l-transparent mr-2" />
          {t('system_log.viewer.loading_older')}
        </div>
      )}
      {!hasOlder && entries.length > 0 && (
        <div className="text-center py-2 text-xs" style={{ color: 'var(--ux-terminal-muted)' }}>
          {t('system_log.viewer.beginning')}
        </div>
      )}
      {isLoading && entries.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--ux-terminal-muted)' }}>
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-l-transparent mr-2" />
          {t('system_log.viewer.loading')}
        </div>
      ) : entries.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--ux-terminal-muted)' }}>
          {t('system_log.viewer.empty')}
        </div>
      ) : (
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TerminalLogLine entry={entries[virtualRow.index]!} highlightTerm={search} />
            </div>
          ))}
        </div>
      )}
    </TerminalShell>
  );
}
