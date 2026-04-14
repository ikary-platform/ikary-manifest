import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrandingDataHooksProvider,
  CellBrandingProvider,
  ThemeModeProvider,
  createLocalStorageBrandingHooks,
} from '@ikary/cell-branding/ui';
import { App } from './App';
import '@ikary/system-ikary-ui/styles';
import './styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const brandingHooks = createLocalStorageBrandingHooks({
  storageKey: 'ikary.try-demo.branding',
});

export const TRY_DEMO_BRANDING_CELL_ID = 'try-demo';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root missing');

createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <BrandingDataHooksProvider value={brandingHooks}>
          <CellBrandingProvider cellId={TRY_DEMO_BRANDING_CELL_ID}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CellBrandingProvider>
        </BrandingDataHooksProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
