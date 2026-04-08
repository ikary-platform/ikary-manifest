import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CellAppRenderer, useCreateApiDataStore } from '@ikary/renderer';
import type { EntityApiAdapter } from '@ikary/renderer';
import type { CellManifestV1 } from '@ikary/contract';
import { useManifest } from './hooks/use-manifest.js';
import { useLocalEntityAdapter } from './hooks/use-local-entity-adapter.js';
import { ErrorPanel } from './components/ErrorPanel.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: false } },
});

const dataApiUrl = (import.meta as any).env?.VITE_DATA_API_URL;
const dataMode = dataApiUrl ? 'live' : 'mock';

function LiveRenderer({ manifest }: { manifest: CellManifestV1 }) {
  const adapter = useLocalEntityAdapter();
  const store = useCreateApiDataStore(manifest, adapter);

  return (
    <CellAppRenderer
      manifest={manifest}
      dataMode="live"
      apiAdapter={adapter}
    />
  );
}

function AppInner() {
  const state = useManifest();

  if (state.status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#6b7280' }}>
        Loading manifest…
      </div>
    );
  }

  if (state.status === 'error') {
    return <ErrorPanel errors={state.errors} />;
  }

  if (dataMode === 'live') {
    return <LiveRenderer manifest={state.manifest} />;
  }

  return <CellAppRenderer manifest={state.manifest} dataMode="mock" />;
}

export function PreviewApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
