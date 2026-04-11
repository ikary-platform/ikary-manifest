/**
 * Runtime configuration for the preview server client bundle.
 *
 * In production (Docker), the Express server injects a `<script>` tag that sets
 * `window.__IKARY_CONFIG__` before the app boots.  In Vite dev mode the values
 * come from `import.meta.env.VITE_*` which are baked in at build time.
 */

export interface IkaryRuntimeConfig {
  /** Base URL of the cell-runtime-api (e.g. "http://localhost:4000"). */
  dataApiUrl?: string;
  /** Preview auth token (JWT) for authenticated API requests. */
  authToken?: string;
}

declare global {
  interface Window {
    __IKARY_CONFIG__?: IkaryRuntimeConfig;
  }
}

let cached: IkaryRuntimeConfig | null = null;

export function getRuntimeConfig(): IkaryRuntimeConfig {
  if (cached) return cached;

  // 1. Runtime injection from the Express production server
  if (typeof window !== 'undefined' && window.__IKARY_CONFIG__) {
    cached = window.__IKARY_CONFIG__;
    return cached;
  }

  // 2. Vite dev-mode fallback (replaced at build time)
  const env = (import.meta as any).env;
  cached = {
    dataApiUrl: env?.VITE_DATA_API_URL,
  };
  return cached;
}
