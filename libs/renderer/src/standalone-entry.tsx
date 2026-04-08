/**
 * Standalone IIFE entry point for the self-contained browser preview.
 *
 * Reads window.__IKARY_MANIFEST__ (a compiled CellManifestV1 JSON object),
 * then mounts CellAppRenderer in mock-data mode into #root.
 *
 * Built by: vite build --config vite.standalone.config.ts
 * Output:   dist/standalone/renderer.iife.js
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CellAppRenderer } from './components/cell-app-renderer';
import type { CellManifestV1 } from '@ikary/contract';

declare global {
  interface Window {
    __IKARY_MANIFEST__: unknown;
  }
}

function mount(): void {
  const raw = window.__IKARY_MANIFEST__;
  if (!raw || typeof raw !== 'object') {
    document.body.innerHTML =
      '<div style="font-family:sans-serif;padding:2rem;color:#b91c1c">' +
      '<strong>IKARY Preview Error:</strong> window.__IKARY_MANIFEST__ is not set.' +
      '</div>';
    return;
  }

  const manifest = raw as CellManifestV1;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: false } },
  });

  const el = document.getElementById('root');
  if (!el) {
    console.error('[IkaryRuntime] No #root element found');
    return;
  }

  createRoot(el).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <CellAppRenderer manifest={manifest} dataMode="mock" />
      </QueryClientProvider>
    </StrictMode>,
  );
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
