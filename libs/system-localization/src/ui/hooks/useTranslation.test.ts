import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '../LocalizationProvider';
import { useTranslation } from './useTranslation';
import type { LocalizationConfig, LocaleMessages } from '../../shared/index';
import type { LocaleLoaderMap } from '../locale.loader';

const config: LocalizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};

const loaders: LocaleLoaderMap = {
  en: async () => ({ 'app.title': 'Hello' }) as LocaleMessages,
  fr: async () => ({ 'app.title': 'Bonjour' }) as LocaleMessages,
};

function createWrapper(initialLocale = 'en') {
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

describe('useTranslation', () => {
  it('returns t, locale, defaultLocale, supportedLocales, setLocale, and isLoading', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: createWrapper('en') });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.t).toBe('function');
    expect(result.current.locale).toBe('en');
    expect(result.current.defaultLocale).toBe('en');
    expect(result.current.supportedLocales).toEqual(['en', 'fr']);
    expect(typeof result.current.setLocale).toBe('function');
    expect(result.current.t('app.title')).toBe('Hello');
  });

  it('switches locale via setLocale', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: createWrapper('en') });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setLocale('fr');
    });

    await waitFor(() => {
      expect(result.current.locale).toBe('fr');
    });

    expect(result.current.t('app.title')).toBe('Bonjour');
  });
});
