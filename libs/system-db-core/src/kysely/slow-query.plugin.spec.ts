import { describe, it, expect, vi } from 'vitest';
import { createQueryLogger } from './slow-query.plugin.js';
import type { LogEvent } from 'kysely';

function makeQueryEvent(durationMs: number): LogEvent {
  return {
    level: 'query',
    query: { sql: 'select 1', parameters: [], query: {} as any },
    queryDurationMillis: durationMs,
  } as unknown as LogEvent;
}

function makeErrorEvent(): LogEvent {
  return { level: 'error', error: new Error('db error') } as unknown as LogEvent;
}

describe('createQueryLogger', () => {
  it('calls onSlowQuery when query exceeds the threshold', () => {
    const onSlowQuery = vi.fn();
    const logger = createQueryLogger({ thresholdMs: 100, onSlowQuery });
    logger(makeQueryEvent(200));
    expect(onSlowQuery).toHaveBeenCalledOnce();
    expect(onSlowQuery).toHaveBeenCalledWith({ query: 'select 1', durationMs: 200 });
  });

  it('does not call onSlowQuery when query is under the threshold', () => {
    const onSlowQuery = vi.fn();
    const logger = createQueryLogger({ thresholdMs: 100, onSlowQuery });
    logger(makeQueryEvent(50));
    expect(onSlowQuery).not.toHaveBeenCalled();
  });

  it('calls onSlowQuery when query equals the threshold', () => {
    const onSlowQuery = vi.fn();
    const logger = createQueryLogger({ thresholdMs: 100, onSlowQuery });
    logger(makeQueryEvent(100));
    expect(onSlowQuery).toHaveBeenCalledOnce();
  });

  it('uses default threshold of 500ms when not specified', () => {
    const onSlowQuery = vi.fn();
    const logger = createQueryLogger({ onSlowQuery });
    logger(makeQueryEvent(499));
    expect(onSlowQuery).not.toHaveBeenCalled();
    logger(makeQueryEvent(500));
    expect(onSlowQuery).toHaveBeenCalledOnce();
  });

  it('writes to stderr using the default logger when no custom logger provided', () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const logger = createQueryLogger({ thresholdMs: 0 });
    logger(makeQueryEvent(1));
    expect(stderrSpy).toHaveBeenCalled();
    stderrSpy.mockRestore();
  });

  it('ignores non-query log events', () => {
    const onSlowQuery = vi.fn();
    const logger = createQueryLogger({ thresholdMs: 0, onSlowQuery });
    logger(makeErrorEvent());
    expect(onSlowQuery).not.toHaveBeenCalled();
  });
});
