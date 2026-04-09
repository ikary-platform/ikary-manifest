import type { LogEvent } from 'kysely';

export interface SlowQueryLoggerOptions {
  /** Queries exceeding this threshold are logged. Default: 500ms. */
  thresholdMs?: number;
  /** Custom logger. Default: writes to stderr. */
  onSlowQuery?: (event: { query: string; durationMs: number }) => void;
}

export function createQueryLogger(options: SlowQueryLoggerOptions = {}) {
  const thresholdMs = options.thresholdMs ?? 500;
  const onSlowQuery =
    options.onSlowQuery ??
    ((event) => {
      process.stderr.write(`[slow-query] ${event.durationMs}ms — ${event.query}\n`);
    });

  return (event: LogEvent) => {
    if (event.level === 'query') {
      const durationMs = event.queryDurationMillis;
      if (durationMs >= thresholdMs) {
        onSlowQuery({ query: event.query.sql, durationMs });
      }
    }
  };
}
