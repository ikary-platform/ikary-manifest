import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '../LocalizationProvider';
import { useOptionalT } from './useOptionalT';
import type { LocalizationConfig, LocaleMessages } from '../../shared/index';
import type { LocaleLoaderMap } from '../locale.loader';

const FALLBACK: LocaleMessages = {
  'common.cancel': 'Cancel',
  'entity.list.create_button': 'Create {entityName}',
  'greet.plain': 'Hello',
};

const config: LocalizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};

const loaders: LocaleLoaderMap = {
  en: async () =>
    ({
      'common.cancel': 'Close', // override the fallback
    }) as LocaleMessages,
};

function withProviderWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(LocalizationProvider, { config, loaders }, children),
  );
}

describe('useOptionalT — without provider', () => {
  it('uses fallback message when no provider is mounted', () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK));
    expect(result.current('common.cancel')).toBe('Cancel');
  });

  it('interpolates {var} placeholders in fallback messages', () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK));
    expect(result.current('entity.list.create_button', { entityName: 'Order' })).toBe('Create Order');
  });

  it('leaves unresolved placeholders intact', () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK));
    expect(result.current('entity.list.create_button')).toBe('Create {entityName}');
  });

  it('leaves {foo} as-is when value is null or undefined', () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK));
    expect(result.current('entity.list.create_button', { entityName: null as unknown as string })).toBe(
      'Create {entityName}',
    );
    expect(result.current('entity.list.create_button', { entityName: undefined as unknown as string })).toBe(
      'Create {entityName}',
    );
  });

  it('returns the id when the fallback map does not contain it', () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK));
    expect(result.current('unknown.key')).toBe('unknown.key');
  });

  it('returns plain message unchanged when no values are supplied', () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK));
    expect(result.current('greet.plain')).toBe('Hello');
  });
});

describe('useOptionalT — with provider', () => {
  it('prefers the provider defaultMessages entry over the fallback', async () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK), { wrapper: withProviderWrapper });
    await waitFor(() => {
      expect(result.current('common.cancel')).toBe('Close');
    });
  });

  it('falls back to the fallback map when the provider catalog has no match', async () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK), { wrapper: withProviderWrapper });
    await waitFor(() => {
      expect(result.current('common.cancel')).toBe('Close');
    });
    expect(result.current('greet.plain')).toBe('Hello');
  });

  it('returns the id when neither provider nor fallback has the key', async () => {
    const { result } = renderHook(() => useOptionalT(FALLBACK), { wrapper: withProviderWrapper });
    await waitFor(() => {
      expect(result.current('common.cancel')).toBe('Close');
    });
    expect(result.current('totally.missing')).toBe('totally.missing');
  });
});
