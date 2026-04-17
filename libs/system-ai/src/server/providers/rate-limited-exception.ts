import { HttpException, HttpStatus } from '@nestjs/common';
import type { ProviderRateLimitHeaders } from '../../shared/provider.interface';

export interface RateLimitedExceptionPayload {
  readonly message: string;
  readonly provider: string;
  readonly retryAfterMs: number;
  readonly headers?: ProviderRateLimitHeaders;
}

/**
 * Thrown by a provider when the upstream API returns HTTP 429. Carries the
 * parsed `Retry-After` value (or a sensible default) and any rate-limit
 * telemetry the provider surfaced, so the runner can decide between waiting
 * and rotating.
 *
 * Extends HttpException (429) so error-normalization paths that inspect
 * `HttpException#getResponse()` keep working.
 */
export class RateLimitedException extends HttpException {
  readonly retryAfterMs: number;
  readonly provider: string;
  readonly providerHeaders?: ProviderRateLimitHeaders;

  constructor(payload: RateLimitedExceptionPayload) {
    super(
      {
        code: 'RATE_LIMITED',
        message: payload.message,
        provider: payload.provider,
        retryAfterMs: payload.retryAfterMs,
        headers: payload.headers,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
    this.retryAfterMs = payload.retryAfterMs;
    this.provider = payload.provider;
    this.providerHeaders = payload.headers;
  }
}

/**
 * Parse a `Retry-After` header value. Accepts a numeric seconds string
 * ("5") or an RFC 1123 HTTP-date. Returns the wait in milliseconds, or
 * `fallbackMs` if unparseable.
 */
export function parseRetryAfterMs(raw: string | null | undefined, fallbackMs: number): number {
  if (!raw) return fallbackMs;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    return Math.max(0, Number(trimmed) * 1000);
  }
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return Math.max(0, parsed - Date.now());
  }
  return fallbackMs;
}
