import type { ApiResult } from './types.js';

let apiReachable = true;
let warnedOnce = false;

export function isOffline(): boolean {
  return process.env.IKARY_OFFLINE === '1';
}

export async function withApiFallback<T>(
  remoteFn: () => Promise<ApiResult<T>>,
  localFn: () => T | Promise<T>,
): Promise<T> {
  if (isOffline() || !apiReachable) {
    return localFn();
  }

  const result = await remoteFn();

  if (result.ok) {
    return result.data;
  }

  // API failed — mark as unreachable for the rest of this CLI invocation
  apiReachable = false;

  if (!warnedOnce) {
    warnedOnce = true;
    console.error(`  Using local validation (API unreachable: ${result.error})`);
  }

  return localFn();
}
