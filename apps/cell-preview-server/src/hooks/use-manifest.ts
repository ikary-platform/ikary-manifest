import { useState, useEffect, useCallback } from 'react';
import type { CellManifestV1 } from '@ikary/cell-contract';

export type ManifestState =
  | { status: 'loading' }
  | { status: 'error'; errors: Array<{ field: string; message: string }> }
  | { status: 'ready'; manifest: CellManifestV1 };

export function useManifest(): ManifestState {
  const [state, setState] = useState<ManifestState>({ status: 'loading' });

  const fetchManifest = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/manifest.json');
      const json = await res.json();

      if (!res.ok || json?.valid === false) {
        setState({ status: 'error', errors: json?.errors ?? [{ field: 'root', message: 'Failed to load manifest' }] });
        return;
      }

      setState({ status: 'ready', manifest: json as CellManifestV1 });
    } catch (err: any) {
      setState({ status: 'error', errors: [{ field: 'root', message: err.message }] });
    }
  }, []);

  useEffect(() => {
    fetchManifest();

    const es = new EventSource('/manifest-events');
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'manifest:changed') {
        fetchManifest();
      }
    };
    return () => es.close();
  }, [fetchManifest]);

  return state;
}
