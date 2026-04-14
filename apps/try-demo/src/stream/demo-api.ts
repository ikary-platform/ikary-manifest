import type { BlueprintMetadata } from '@ikary/cell-ai';

export type DemoStatusReason = 'FEATURE_DISABLED' | 'BUDGET_EXHAUSTED';

export interface DemoStatus {
  aiAvailable: boolean;
  reason?: DemoStatusReason;
}

/**
 * Local dev/test override via URL query string. Lets you preview the
 * disabled-demo UX without restarting the API or flipping env vars.
 *
 *   ?demo=off       -> aiAvailable:false, reason:FEATURE_DISABLED
 *   ?demo=disabled  -> same as above
 *   ?demo=budget    -> aiAvailable:false, reason:BUDGET_EXHAUSTED
 *   ?demo=on        -> force live (useful if API returns disabled)
 *   (no param)      -> fetch real status from the API
 */
export function readDemoStatusOverride(search: string = typeof window !== 'undefined' ? window.location.search : ''): DemoStatus | null {
  const params = new URLSearchParams(search);
  const v = params.get('demo');
  if (!v) return null;
  switch (v.toLowerCase()) {
    case 'off':
    case 'disabled':
      return { aiAvailable: false, reason: 'FEATURE_DISABLED' };
    case 'budget':
    case 'exhausted':
      return { aiAvailable: false, reason: 'BUDGET_EXHAUSTED' };
    case 'on':
    case 'live':
      return { aiAvailable: true };
    default:
      return null;
  }
}

export async function fetchDemoStatus(signal?: AbortSignal): Promise<DemoStatus> {
  const override = readDemoStatusOverride();
  if (override) return override;
  const res = await fetch('/api/demo/status', { signal });
  if (!res.ok) throw new Error(`GET /demo/status -> ${res.status}`);
  return (await res.json()) as DemoStatus;
}

export async function fetchBlueprints(signal?: AbortSignal): Promise<BlueprintMetadata[]> {
  const res = await fetch('/api/blueprints', { signal });
  if (!res.ok) throw new Error(`GET /blueprints -> ${res.status}`);
  const body = (await res.json()) as { items: BlueprintMetadata[] };
  return body.items;
}

export async function fetchBlueprintManifest(id: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(`/api/blueprints/${id}`, { signal });
  if (!res.ok) throw new Error(`GET /blueprints/${id} -> ${res.status}`);
  const body = (await res.json()) as { manifest: unknown };
  return body.manifest;
}
