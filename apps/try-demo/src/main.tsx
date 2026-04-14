import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import '@ikary/system-ikary-ui/styles';
import './styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root missing');

createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
