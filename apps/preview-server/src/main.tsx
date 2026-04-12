import './globals.css';
import 'virtual:custom-primitives';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LocalizationProvider } from '@ikary/system-localization/ui';
import { PreviewApp } from './PreviewApp.js';
import { config, loaders } from './i18n/config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider config={config} loaders={loaders}>
      <PreviewApp />
    </LocalizationProvider>
  </StrictMode>,
);
