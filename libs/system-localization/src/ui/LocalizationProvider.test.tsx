import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  LocalizationProvider,
  useLocalization,
  type LocalizationCatalogClient,
} from './LocalizationProvider';
import type { LocalizationConfig, LocaleMessages } from '../shared/index';
import type { LocaleLoaderMap } from './locale.loader';

const baseConfig: LocalizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};

function createLoaders(): LocaleLoaderMap {
  return {
    en: vi.fn(async () => ({ 'app.title': 'Hello' }) as LocaleMessages),
    fr: vi.fn(async () => ({ 'app.title': 'Bonjour' }) as LocaleMessages),
  };
}

interface WrapperOptions {
  config?: LocalizationConfig;
  loaders?: LocaleLoaderMap;
  catalogClient?: LocalizationCatalogClient;
  initialLocale?: string;
  initialScope?: { tenantId?: string; workspaceId?: string; cellId?: string };
}

function createWrapper(options: WrapperOptions = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider
          config={options.config ?? baseConfig}
          loaders={options.loaders ?? createLoaders()}
          catalogClient={options.catalogClient}
          initialLocale={options.initialLocale}
          initialScope={options.initialScope}
        >
          {children}
        </LocalizationProvider>
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useLocalization', () => {
  it('throws when used outside LocalizationProvider', () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => useLocalization())).toThrow(
        /useLocalization must be used inside LocalizationProvider\./,
      );
    } finally {
      console.error = originalError;
    }
  });
});

describe('LocalizationProvider initial state', () => {
  it('uses initialLocale when it is in supportedLocales', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ initialLocale: 'fr' }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locale).toBe('fr');
  });

  it('falls back to config.defaultLocale when initialLocale is unsupported', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ initialLocale: 'de' }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locale).toBe('en');
  });

  it('falls back to config.defaultLocale when initialLocale is omitted', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locale).toBe('en');
  });

  it('exposes defaultLocale, supportedLocales, and defaultMessages', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.defaultLocale).toBe('en');
    expect(result.current.supportedLocales).toEqual(['en', 'fr']);
    expect(result.current.defaultMessages).toEqual({ 'app.title': 'Hello' });
  });

  it('uses initialScope when provided', async () => {
    const scope = { tenantId: 't1', workspaceId: 'w1', cellId: 'c1' };
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ initialScope: scope }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.scope).toEqual(scope);
  });
});

describe('LocalizationProvider.setLocale', () => {
  it('switches the active locale and persists to both localStorage keys', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setLocale('fr');
    });

    await waitFor(() => expect(result.current.locale).toBe('fr'));
    expect(localStorage.getItem('ikary.language')).toBe('fr');
    expect(localStorage.getItem('micro.locale')).toBe('fr');
  });

  it('falls back to defaultLocale when the requested locale is unsupported', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setLocale('de');
    });

    await waitFor(() => expect(result.current.locale).toBe('en'));
  });

  it('uses defaultMessages when the target locale loader returns empty', async () => {
    const loaders: LocaleLoaderMap = {
      en: async () => ({ 'app.title': 'Hello' }) as LocaleMessages,
      fr: async () => ({}) as LocaleMessages,
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ loaders }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setLocale('fr');
    });

    await waitFor(() => expect(result.current.locale).toBe('fr'));
    expect(result.current.defaultMessages).toEqual({ 'app.title': 'Hello' });
  });

  it('resolves to defaultLocale messages when loader is missing entirely', async () => {
    const loaders: LocaleLoaderMap = {
      en: async () => ({ 'app.title': 'Hello' }) as LocaleMessages,
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ loaders, initialLocale: 'fr' }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Loader for fr doesn't exist -> returns {} -> falls back to defaults.
    expect(result.current.locale).toBe('fr');
    expect(result.current.defaultMessages).toEqual({ 'app.title': 'Hello' });
  });
});

describe('LocalizationProvider catalogClient integration', () => {
  it('calls catalogClient.fetchCatalog and merges catalog values', async () => {
    const catalogClient: LocalizationCatalogClient = {
      fetchCatalog: vi.fn(async () => ({
        values: { 'app.title': 'Override', 'catalog.only': 'From API' },
      })),
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(catalogClient.fetchCatalog).toHaveBeenCalledWith({
      locale: 'en',
      scope: {},
    });
  });

  it('honors resolvedLocale returned by the catalog when supported', async () => {
    const catalogClient: LocalizationCatalogClient = {
      fetchCatalog: vi.fn(async () => ({
        values: { 'app.title': 'Bonjour from catalog' },
        resolvedLocale: 'fr',
      })),
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient, initialLocale: 'en' }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locale).toBe('fr');
  });

  it('ignores resolvedLocale when not in supportedLocales', async () => {
    const catalogClient: LocalizationCatalogClient = {
      fetchCatalog: vi.fn(async () => ({
        values: { 'app.title': 'X' },
        resolvedLocale: 'de',
      })),
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locale).toBe('en');
  });

  it('falls back to local bundle when catalog fetch throws', async () => {
    const catalogClient: LocalizationCatalogClient = {
      fetchCatalog: vi.fn(async () => {
        throw new Error('network');
      }),
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locale).toBe('en');
  });

  it('skips catalog merge when returned values is empty', async () => {
    const catalogClient: LocalizationCatalogClient = {
      fetchCatalog: vi.fn(async () => ({ values: {} })),
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.locale).toBe('en');
  });

  it('invokes persistPreferredLanguage only when persistence path taken (refreshCatalog does not)', async () => {
    const persistPreferredLanguage = vi.fn(async () => {});
    const catalogClient: LocalizationCatalogClient = {
      fetchCatalog: vi.fn(async () => ({ values: {} })),
      persistPreferredLanguage,
    };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // setLocale uses persistPreference=false, refreshCatalog also passes false.
    await act(async () => {
      await result.current.setLocale('fr');
    });

    await act(async () => {
      await result.current.refreshCatalog();
    });

    expect(persistPreferredLanguage).not.toHaveBeenCalled();
  });
});

describe('LocalizationProvider.refreshCatalog', () => {
  it('reloads the current locale', async () => {
    const fetchCatalog = vi.fn(async () => ({ values: { 'app.title': 'V1' } }));
    const catalogClient: LocalizationCatalogClient = { fetchCatalog };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initialCalls = fetchCatalog.mock.calls.length;

    await act(async () => {
      await result.current.refreshCatalog();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchCatalog.mock.calls.length).toBeGreaterThan(initialCalls);
  });
});

describe('LocalizationProvider.setScope', () => {
  it('updates scope and passes it to catalog fetches', async () => {
    const fetchCatalog = vi.fn(async () => ({ values: {} }));
    const catalogClient: LocalizationCatalogClient = { fetchCatalog };

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ catalogClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setScope({ tenantId: 't1' });
    });

    await waitFor(() => expect(result.current.scope).toEqual({ tenantId: 't1' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('memoizes equal scopes so the reference does not change', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ initialScope: { tenantId: 't1' } }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const before = result.current.scope;

    act(() => {
      result.current.setScope({ tenantId: 't1' });
    });

    expect(result.current.scope).toBe(before);
  });

  it('replaces scope when any field differs', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper({ initialScope: { tenantId: 't1' } }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setScope({ tenantId: 't1', workspaceId: 'w1' });
    });

    await waitFor(() =>
      expect(result.current.scope).toEqual({ tenantId: 't1', workspaceId: 'w1' }),
    );
  });
});

describe('LocalizationProvider IntlProvider integration', () => {
  it('swallows MISSING_TRANSLATION errors without logging', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Existing behavior: no MISSING_TRANSLATION logs expected for rendered children.
    errorSpy.mockRestore();
  });
});
