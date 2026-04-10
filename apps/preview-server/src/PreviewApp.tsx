import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CellAppRenderer } from '@ikary/renderer';
import type { EntityApiAdapter } from '@ikary/renderer';
import type { CellManifestV1 } from '@ikary/contract';
import { useManifest } from './hooks/use-manifest.js';
import { useLocalEntityAdapter } from './hooks/use-local-entity-adapter.js';
import { ErrorPanel } from './components/ErrorPanel.js';
import { PreviewPrimitiveStudio } from './primitive-studio.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: false } },
});

const dataApiUrl = (import.meta as any).env?.VITE_DATA_API_URL;
const dataMode = dataApiUrl ? 'live' : 'mock';

function LiveRenderer({ manifest }: { manifest: CellManifestV1 }) {
  const adapter = useLocalEntityAdapter();

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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/__primitive-studio/*" element={<PreviewPrimitiveStudio />} />
          <Route path="*" element={<ManifestPreview />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
