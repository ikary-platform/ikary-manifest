/**
 * Generates a unique correlation ID for outgoing HTTP requests.
 *
 * Uses `crypto.randomUUID()` when available (all modern browsers and Node 19+).
 * Falls back to a Math.random-based v4 UUID for non-secure contexts (e.g.
 * custom hostnames served over plain HTTP).
 */
export function generateCorrelationId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
