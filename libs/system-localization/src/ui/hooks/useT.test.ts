import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '../LocalizationProvider';
import { useT } from './useT';
import type { LocalizationConfig, LocaleMessages } from '../../shared/index';
import type { LocaleLoaderMap } from '../locale.loader';

const config: LocalizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};

const loaders: LocaleLoaderMap = {
  en: async () =>
    ({
      'app.title': 'Hello',
      'app.greeting': 'Hello, {name}!',
      'only.default': 'Default Value',
    }) as LocaleMessages,
  fr: async () => ({ 'app.title': 'Bonjour' }) as LocaleMessages,
};

function createWrapper(initialLocale: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(LocalizationProvider, {
        config,
        loaders,
        initialLocale,
        children,
      }),
    );
  };
}

describe('useT', () => {
  it('translates a message id with formatMessage', async () => {
    const { result } = renderHook(() => useT(), { wrapper: createWrapper('en') });

    await waitFor(() => {
      expect(result.current('app.title')).toBe('Hello');
    });
  });

  it('interpolates values into the translated string', async () => {
    const { result } = renderHook(() => useT(), { wrapper: createWrapper('en') });

    await waitFor(() => {
      expect(result.current('app.greeting', { name: 'Ada' })).toBe('Hello, Ada!');
    });
  });

  it('falls back to the defaultMessages entry when active locale lacks the key', async () => {
    const { result } = renderHook(() => useT(), { wrapper: createWrapper('fr') });

    await waitFor(() => {
      expect(result.current('only.default')).toBe('Default Value');
    });
  });

  it('returns the message id when no translation or default exists', async () => {
    const { result } = renderHook(() => useT(), { wrapper: createWrapper('en') });

    await waitFor(() => {
      expect(result.current('app.title')).toBe('Hello');
    });
    expect(result.current('missing.key')).toBe('missing.key');
  });
});
