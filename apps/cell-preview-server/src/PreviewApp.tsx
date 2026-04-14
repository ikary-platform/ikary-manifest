import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CellAppRenderer } from '@ikary/cell-renderer';
import type { CellManifestV1 } from '@ikary/cell-contract';
import { CellApiProvider, DataHooksProvider, liveDataHooks, mockDataHooks } from '@ikary/cell-data';
import {
  BrandingAdminPanel,
  BrandingDataHooksProvider,
  CellBrandingProvider,
  ThemeModeProvider,
  createLiveBrandingHooks,
  createLocalStorageBrandingHooks,
} from '@ikary/cell-branding/ui';
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

const brandingHooks =
  dataMode === 'live' && dataApiUrl
    ? createLiveBrandingHooks({
        apiBase: dataApiUrl,
        getToken: () => authToken ?? null,
      })
    : createLocalStorageBrandingHooks({
        storageKey: 'ikary.preview.branding',
      });

function LiveRenderer({ manifest }: { manifest: CellManifestV1 }) {
  const cellKey = manifest.metadata?.key ?? 'default';
  const adapter = useRQEntityAdapter(cellKey);

  return <CellAppRenderer manifest={manifest} dataMode="live" apiAdapter={adapter} />;
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

function BrandingAdminRoute() {
  const state = useManifest();
  const cellId =
    state.status === 'ready' ? state.manifest.metadata?.key ?? 'preview' : 'preview';
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <BrandingAdminPanel cellId={cellId} title="Preview branding" />
      </div>
    </div>
  );
}

function BrandedRoutes() {
  const state = useManifest();
  const cellId = useMemo(() => {
    return state.status === 'ready' ? state.manifest.metadata?.key ?? 'preview' : 'preview';
  }, [state]);

  return (
    <CellBrandingProvider cellId={cellId}>
      <Routes>
        <Route path="/__primitive-studio/*" element={<PreviewPrimitiveStudio />} />
        <Route path="/__branding" element={<BrandingAdminRoute />} />
        <Route path="*" element={<ManifestPreview />} />
      </Routes>
    </CellBrandingProvider>
  );
}

export function PreviewApp() {
  const dataHooks = dataMode === 'live' ? liveDataHooks : mockDataHooks;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <BrandingDataHooksProvider value={brandingHooks}>
          <BrowserRouter>
            {dataMode === 'live' && dataApiUrl ? (
              <CellApiProvider apiBase={dataApiUrl} getToken={() => authToken ?? null}>
                <DataHooksProvider value={dataHooks}>
                  <BrandedRoutes />
                </DataHooksProvider>
              </CellApiProvider>
            ) : (
              <DataHooksProvider value={dataHooks}>
                <BrandedRoutes />
              </DataHooksProvider>
            )}
          </BrowserRouter>
        </BrandingDataHooksProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}
