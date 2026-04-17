import * as React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '../LocalizationProvider';
import { LanguageProvider, type LanguageApiClient } from '../LanguageProvider';
import { useLanguage } from './useLanguage';
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

const apiClient: LanguageApiClient = {
  listLanguages: async () => [],
  persistUserLanguage: async () => {},
};

beforeEach(() => {
  localStorage.clear();
});

describe('useLanguage', () => {
  it('throws when used outside LanguageProvider', () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => useLanguage())).toThrow(
        /useLanguage must be used inside LanguageProvider\./,
      );
    } finally {
      console.error = originalError;
    }
  });

  it('returns the LanguageProvider context value when wrapped', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(LocalizationProvider, {
          config,
          loaders,
          children: React.createElement(LanguageProvider, { apiClient, children }),
        }),
      );

    const { result } = renderHook(() => useLanguage(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.language).toBe('en');
    expect(typeof result.current.setLanguage).toBe('function');
    expect(typeof result.current.refreshLanguages).toBe('function');
    expect(result.current.errorMessage).toBeNull();
  });
});
