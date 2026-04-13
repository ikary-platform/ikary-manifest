import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CellAppRenderer } from '@ikary/cell-renderer';
import type { CellManifestV1 } from '@ikary/cell-contract';
import { CellApiProvider, DataHooksProvider, liveDataHooks, mockDataHooks } from '@ikary/cell-data';
import { useManifest } from './hooks/use-manifest.js';
import { useRQEntityAdapter } from './hooks/use-rq-entity-adapter.js';
import { ErrorPanel } from './components/ErrorPanel.js';
import { PreviewPrimitiveStudio } from './primitive-studio.js';
import { getRuntimeConfig } from './runtime-config.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: false },
    mutations: {
      onError: (error) => {
        console.error('[preview] Mutation failed:', error);
      },
    },
  },
});

const { dataApiUrl, authToken } = getRuntimeConfig();
const dataMode = dataApiUrl ? 'live' : 'mock';

function LiveRenderer({ manifest }: { manifest: CellManifestV1 }) {
  const cellKey = manifest.metadata?.key ?? 'default';
  const adapter = useRQEntityAdapter(cellKey);

  return (
    <CellAppRenderer
      manifest={manifest}
      dataMode="live"
      apiAdapter={adapter}
    />
  );
}

function ManifestPreview() {
  const state = useManifest();

  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
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
  const dataHooks = dataMode === 'live' ? liveDataHooks : mockDataHooks;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {dataMode === 'live' && dataApiUrl ? (
          <CellApiProvider apiBase={dataApiUrl} getToken={() => authToken ?? null}>
            <DataHooksProvider value={dataHooks}>
              <Routes>
                <Route path="/__primitive-studio/*" element={<PreviewPrimitiveStudio />} />
                <Route path="*" element={<ManifestPreview />} />
              </Routes>
            </DataHooksProvider>
          </CellApiProvider>
        ) : (
          <DataHooksProvider value={dataHooks}>
            <Routes>
              <Route path="/__primitive-studio/*" element={<PreviewPrimitiveStudio />} />
              <Route path="*" element={<ManifestPreview />} />
            </Routes>
          </DataHooksProvider>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
