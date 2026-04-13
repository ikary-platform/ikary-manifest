import { CellApiError } from './cell-api-error';
import { generateCorrelationId } from './correlation-id';

export interface CellApiFetchOptions {
  url: string;
  method: string;
  body?: unknown;
  token: string | null;
}

/**
 * Low-level fetch wrapper used by all entity hooks.
 *
 * Every request is tagged with a unique `X-Correlation-ID` header so the
 * backend can correlate log entries for structured logging / tracing.
 */
export async function cellApiFetch<T>(opts: CellApiFetchOptions): Promise<T> {
  const correlationId = generateCorrelationId();
  const res = await fetch(opts.url, {
    method: opts.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    throw new CellApiError(`HTTP ${res.status}`, res.status, await res.json().catch(() => null));
  }
  return res.json() as Promise<T>;
}
