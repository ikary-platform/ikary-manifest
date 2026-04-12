import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from './LocalizationProvider';
import { T } from './T';
import type { LocalizationConfig, LocaleMessages } from '../shared/index';
import type { LocaleLoaderMap } from './locale.loader';

const config: LocalizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};

const loaders: LocaleLoaderMap = {
  en: async () =>
    ({ 'app.title': 'Hello', 'app.greeting': 'Hello, {name}!' }) as LocaleMessages,
  fr: async () =>
    ({ 'app.title': 'Bonjour', 'app.greeting': 'Bonjour, {name} !' }) as LocaleMessages,
};

function renderWithProviders(ui: React.ReactElement, initialLocale = 'en') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider config={config} loaders={loaders} initialLocale={initialLocale}>
        {ui}
      </LocalizationProvider>
    </QueryClientProvider>,
  );
}

describe('T', () => {
  it('renders the translated string for the current locale', async () => {
    const { container } = renderWithProviders(<T id="app.title" />, 'en');

    await waitFor(() => {
      expect(container.textContent).toBe('Hello');
    });
  });

  it('renders the French translation when the French locale is active', async () => {
    const { container } = renderWithProviders(<T id="app.title" />, 'fr');

    await waitFor(() => {
      expect(container.textContent).toBe('Bonjour');
    });
  });

  it('passes values to formatMessage for interpolation', async () => {
    const { container } = renderWithProviders(
      <T id="app.greeting" values={{ name: 'Ikary' }} />,
      'en',
    );

    await waitFor(() => {
      expect(container.textContent).toBe('Hello, Ikary!');
    });
  });

  it('falls back to the message id when no translation exists', async () => {
    const { container } = renderWithProviders(<T id="missing.key" />, 'en');

    await waitFor(() => {
      expect(container.textContent).toBe('missing.key');
    });
  });
});
