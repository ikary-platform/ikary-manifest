import { describe, expect, it } from 'vitest';
import { RateLimitedException, parseRetryAfterMs } from './rate-limited-exception';

describe('parseRetryAfterMs', () => {
  it('parses a numeric seconds string', () => {
    expect(parseRetryAfterMs('5', 1000)).toBe(5000);
    expect(parseRetryAfterMs('0', 1000)).toBe(0);
  });

  it('parses an HTTP-date string', () => {
    // toUTCString rounds down to whole seconds, so the parsed delta is approximate.
    const future = new Date(Date.now() + 5000).toUTCString();
    const ms = parseRetryAfterMs(future, 1000);
    expect(ms).toBeGreaterThanOrEqual(3000);
    expect(ms).toBeLessThanOrEqual(6000);
  });

  it('falls back when the value is null, empty, or unparseable', () => {
    expect(parseRetryAfterMs(null, 1234)).toBe(1234);
    expect(parseRetryAfterMs('', 1234)).toBe(1234);
    expect(parseRetryAfterMs('not-a-date', 1234)).toBe(1234);
  });

  it('clamps negative HTTP-date values to zero', () => {
    const past = new Date(Date.now() - 5000).toUTCString();
    expect(parseRetryAfterMs(past, 1000)).toBe(0);
  });
});

describe('RateLimitedException', () => {
  it('exposes retryAfterMs and provider on the response payload', () => {
    const ex = new RateLimitedException({
      message: 'anthropic: HTTP 429 - rate limit',
      provider: 'anthropic',
      retryAfterMs: 7000,
      headers: { tokensRemaining: 0, retryAfterMs: 7000 },
    });
    expect(ex.retryAfterMs).toBe(7000);
    expect(ex.provider).toBe('anthropic');
    const response = ex.getResponse() as { code: string; retryAfterMs: number };
    expect(response.code).toBe('RATE_LIMITED');
    expect(response.retryAfterMs).toBe(7000);
    expect(ex.getStatus()).toBe(429);
  });
});
