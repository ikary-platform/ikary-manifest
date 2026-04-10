import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlatformLogEntry } from '../shared/log-entry.schema';
import type { LogEntryLevel } from '../shared/log-level.schema';

export interface LogStreamFetchParams {
  pageSize: number;
  levels?: LogEntryLevel[];
  search?: string;
  before?: string;
  beforeId?: string;
}

export interface LogStreamFetchResult {
  data: PlatformLogEntry[];
  meta: {
    pageSize: number;
    count: number;
    oldestCursor: { before: string; beforeId: string } | null;
  };
}

export interface UseLogStreamOptions {
  fetchLogs: (params: LogStreamFetchParams) => Promise<LogStreamFetchResult>;
  pageSize?: number;
  levels?: LogEntryLevel[];
  search?: string;
}

export interface UseLogStreamResult {
  entries: PlatformLogEntry[];
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasOlder: boolean;
  loadOlder: () => Promise<void>;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useLogStream({ fetchLogs, pageSize = 1000, levels, search }: UseLogStreamOptions): UseLogStreamResult {
  const [entries, setEntries] = useState<PlatformLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cursorRef = useRef<{ before: string; beforeId: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(
    async (cursor?: { before: string; beforeId: string }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params: LogStreamFetchParams = {
        pageSize,
        levels: levels?.length ? levels : undefined,
        search: search || undefined,
        before: cursor?.before,
        beforeId: cursor?.beforeId,
      };

      const result = await fetchLogs(params);

      if (controller.signal.aborted) return null;
      return result;
    },
    [fetchLogs, pageSize, levels, search],
  );

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasOlder(true);
    cursorRef.current = null;

    try {
      const result = await doFetch();
      if (!result) return;

      // Entries arrive DESC from API; reverse to oldest-first for terminal display
      const reversed = [...result.data].reverse();
      setEntries(reversed);
      cursorRef.current = result.meta.oldestCursor;
      setHasOlder(result.meta.count >= pageSize);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(err instanceof Error ? err : new Error('Failed to load logs'));
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, pageSize]);

  const loadOlder = useCallback(async () => {
    if (isLoadingOlder || !hasOlder || !cursorRef.current) return;

    setIsLoadingOlder(true);
    try {
      const result = await doFetch(cursorRef.current);
      if (!result) return;

      const reversed = [...result.data].reverse();
      setEntries((prev) => [...reversed, ...prev]);
      cursorRef.current = result.meta.oldestCursor;
      setHasOlder(result.meta.count >= pageSize);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(err instanceof Error ? err : new Error('Failed to load older logs'));
    } finally {
      setIsLoadingOlder(false);
    }
  }, [doFetch, isLoadingOlder, hasOlder, pageSize]);

  useEffect(() => {
    void loadInitial();
    return () => {
      abortRef.current?.abort();
    };
  }, [loadInitial]);

  return {
    entries,
    isLoading,
    isLoadingOlder,
    hasOlder,
    loadOlder,
    error,
    refresh: loadInitial,
  };
}
