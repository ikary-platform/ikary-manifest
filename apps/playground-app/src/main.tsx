import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@ikary/primitives/registry';
import './index.css';
import { App } from './App';

const PLAYGROUND_ROUTE_PARAM = '__ikary_playground_route';

function isSafePlaygroundRoute(candidate: string): boolean {
  if (!candidate.startsWith('/')) return false;
  if (candidate.startsWith('//')) return false;
  if (candidate.includes('\\')) return false;
  const withoutLeadingSlash = candidate.slice(1);
  return !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(withoutLeadingSlash);
}

function restorePlaygroundDeepLink(): void {
  const currentUrl = new URL(window.location.href);
  const route = currentUrl.searchParams.get(PLAYGROUND_ROUTE_PARAM);
  if (!route || !isSafePlaygroundRoute(route)) return;
  window.history.replaceState(window.history.state, '', `/playground${route}`);
}

restorePlaygroundDeepLink();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/playground">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
