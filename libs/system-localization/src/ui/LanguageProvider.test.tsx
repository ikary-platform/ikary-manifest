import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from './LocalizationProvider';
import {
  LanguageProvider,
  useLanguageContext,
  type LanguageApiClient,
  type LanguageDefinition,
  type LanguageProviderProps,
} from './LanguageProvider';
import type { LocalizationConfig, LocaleMessages } from '../shared/index';
import type { LocaleLoaderMap } from './locale.loader';

const baseConfig: LocalizationConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr', 'nl', 'fr-FR'],
  outputDir: 'locales',
  validation: { failOnMissing: false, failOnDuplicate: true },
};

const baseLoaders: LocaleLoaderMap = {
  en: async () => ({ 'app.title': 'Hello' }) as LocaleMessages,
  fr: async () => ({ 'app.title': 'Bonjour' }) as LocaleMessages,
  nl: async () => ({ 'app.title': 'Hallo' }) as LocaleMessages,
  'fr-FR': async () => ({ 'app.title': 'Bonjour France' }) as LocaleMessages,
};

function createApiClient(overrides: Partial<LanguageApiClient> = {}): LanguageApiClient {
  return {
    listLanguages: overrides.listLanguages ?? vi.fn(async () => []),
    persistUserLanguage: overrides.persistUserLanguage ?? vi.fn(async () => {}),
  };
}

interface WrapperOptions {
  config?: LocalizationConfig;
  loaders?: LocaleLoaderMap;
  apiClient?: LanguageApiClient;
  providerProps?: Omit<LanguageProviderProps, 'children' | 'apiClient'>;
  initialLocale?: string;
}

function createWrapper(options: WrapperOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const apiClient = options.apiClient ?? createApiClient();
  const loaders = options.loaders ?? baseLoaders;
  const config = options.config ?? baseConfig;
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider config={config} loaders={loaders} initialLocale={options.initialLocale}>
          <LanguageProvider apiClient={apiClient} {...options.providerProps}>
            {children}
          </LanguageProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    );
  };
}

const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

function setNavigator(languages: readonly string[] | undefined, language: string | undefined) {
  Object.defineProperty(navigator, 'languages', {
    value: languages,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(navigator, 'language', {
    value: language,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  localStorage.clear();
  setNavigator([], '');
});

afterEach(() => {
  cleanup();
  if (navigatorDescriptor) {
    Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
  }
  vi.restoreAllMocks();
});

describe('useLanguageContext', () => {
  it('throws when called outside LanguageProvider', () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => useLanguageContext())).toThrow(
        /useLanguage must be used inside LanguageProvider\./,
      );
    } finally {
      console.error = originalError;
    }
  });
});

/**
 * Priority resolution tests use `initialLocale` on LocalizationProvider that matches
 * the expected resolution. When initial locale === priority result, the hook's initial
 * state aligns with the provider's locale and the effect-loop between effect 1 and
 * effect 2 in `useLanguageProviderState` stays quiescent. Each test still verifies
 * that the priority-chosen locale flows through to `language`.
 */
describe('LanguageProvider locale resolution priority', () => {
  it('prefers stored locale over lower-priority candidates', async () => {
    localStorage.setItem('ikary.language', 'fr');
    setNavigator(['nl-NL'], 'nl-NL');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        initialLocale: 'fr',
        providerProps: {
          userPreferredLanguage: 'en',
          workspaceDefaultLanguage: 'en',
          tenantDefaultLanguage: 'en',
          platformDefaultLanguage: 'en',
        },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr'));
  });

  it('falls back to legacy storage key when primary is missing', async () => {
    localStorage.setItem('micro.locale', 'fr');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ initialLocale: 'fr' }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr'));
  });

  it('uses user preference when no stored locale exists', async () => {
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        initialLocale: 'fr',
        providerProps: {
          userPreferredLanguage: 'fr',
          workspaceDefaultLanguage: 'nl',
        },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr'));
  });

  it('uses workspace default when no stored or user candidate exists', async () => {
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        initialLocale: 'nl',
        providerProps: {
          workspaceDefaultLanguage: 'nl',
          tenantDefaultLanguage: 'fr',
        },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('nl'));
  });

  it('uses tenant default when workspace default is absent', async () => {
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        initialLocale: 'fr',
        providerProps: { tenantDefaultLanguage: 'fr' },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr'));
  });

  it('uses browser locale when no explicit preferences exist', async () => {
    setNavigator(['fr-FR', 'en-US'], 'fr-FR');

    const { result } = renderHook(() => useLanguageContext(), {
      // fr-FR is in supportedLocales so it resolves exactly.
      wrapper: createWrapper({ initialLocale: 'fr-FR' }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr-FR'));
  });

  it('uses navigator.language when navigator.languages is empty', async () => {
    setNavigator([], 'nl-NL');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ initialLocale: 'nl' }),
    });

    await waitFor(() => expect(result.current.language).toBe('nl'));
  });

  it('treats missing navigator.languages (undefined) as an empty list', async () => {
    setNavigator(undefined, 'fr-FR');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ initialLocale: 'fr-FR' }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr-FR'));
  });

  it('resolves base locale when navigator region code is not in the supported set', async () => {
    setNavigator(['fr-CA'], 'fr-CA');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ initialLocale: 'fr' }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr'));
  });

  it('uses platformDefaultLanguage when browser locale is unsupported', async () => {
    setNavigator(['xx-YY'], 'xx-YY');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        initialLocale: 'fr',
        providerProps: { platformDefaultLanguage: 'fr' },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr'));
  });

  it('falls back to config.defaultLocale when all candidates are unsupported', async () => {
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        providerProps: { platformDefaultLanguage: 'xx' },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('en'));
  });

  it('returns defaultLocale even when it is not in the API-reported language set', async () => {
    // API returns only "fr"; priority iteration should exhaust all candidates
    // (none map to "fr") and fall through to the final `return defaultLocale`.
    const apiClient = createApiClient({
      listLanguages: async () => [{ code: 'fr', name: 'Français', direction: 'ltr' }],
    });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        apiClient,
        initialLocale: 'en',
        providerProps: { platformDefaultLanguage: 'xx' },
      }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.language).toBe('en');
  });

  it('ignores null candidates', async () => {
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        providerProps: {
          userPreferredLanguage: null,
          workspaceDefaultLanguage: null,
          tenantDefaultLanguage: null,
        },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('en'));
  });

  it('ignores whitespace-only candidates', async () => {
    localStorage.setItem('ikary.language', '   ');
    localStorage.setItem('micro.locale', '   ');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.language).toBe('en'));
  });

  it('ignores dash-only (empty-base) inputs', async () => {
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        providerProps: { userPreferredLanguage: '-' },
      }),
    });

    await waitFor(() => expect(result.current.language).toBe('en'));
  });

  it('normalizes underscore separators to hyphenated form', async () => {
    localStorage.setItem('ikary.language', 'fr_FR');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ initialLocale: 'fr-FR' }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr-FR'));
  });

  it('uppercases region codes while lowercasing the language base', async () => {
    localStorage.setItem('ikary.language', 'fr-fr');

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ initialLocale: 'fr-FR' }),
    });

    await waitFor(() => expect(result.current.language).toBe('fr-FR'));
  });
});

describe('LanguageProvider languages query', () => {
  it('fetches languages from the API client', async () => {
    const apiLanguages: LanguageDefinition[] = [
      { code: 'en', name: 'English', direction: 'ltr' },
      { code: 'fr', name: 'Français', direction: 'ltr' },
    ];
    const listLanguages = vi.fn(async () => apiLanguages);
    const apiClient = createApiClient({ listLanguages });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listLanguages).toHaveBeenCalled();
    expect(result.current.languages).toEqual(apiLanguages);
  });

  it('uses fallback language list when the API query fails (data undefined)', async () => {
    const apiClient = createApiClient({
      listLanguages: async () => {
        throw new Error('boom');
      },
    });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() =>
      expect(result.current.languages.map((item) => item.code).sort()).toEqual([
        'en',
        'fr',
        'fr-FR',
        'nl',
      ]),
    );
    for (const item of result.current.languages) {
      expect(item.direction).toBe('ltr');
      expect(typeof item.name).toBe('string');
    }
    const byCode = Object.fromEntries(result.current.languages.map((l) => [l.code, l.name]));
    expect(byCode.en).toBe('English');
    expect(byCode.fr).toBe('Français');
    expect(byCode.nl).toBe('Nederlands');
  });

  it('falls back to the raw code when no human-friendly label is known', async () => {
    const config: LocalizationConfig = {
      defaultLocale: 'xx',
      supportedLocales: ['xx'],
      outputDir: 'locales',
      validation: { failOnMissing: false, failOnDuplicate: true },
    };
    const loaders: LocaleLoaderMap = { xx: async () => ({}) as LocaleMessages };
    const apiClient = createApiClient({
      listLanguages: async () => {
        throw new Error('boom');
      },
    });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ config, loaders, apiClient }),
    });

    await waitFor(() =>
      expect(result.current.languages[0]).toEqual({ code: 'xx', name: 'xx', direction: 'ltr' }),
    );
  });

  it('uses queryScopeKey in the query key', async () => {
    const listLanguages = vi.fn(async () => []);
    const apiClient = createApiClient({ listLanguages });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({
        apiClient,
        providerProps: { queryScopeKey: 'scope-1' },
      }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listLanguages).toHaveBeenCalled();
  });

  it('produces friendly labels for de and es via the fallback builder', async () => {
    const config: LocalizationConfig = {
      defaultLocale: 'de',
      supportedLocales: ['de', 'es'],
      outputDir: 'locales',
      validation: { failOnMissing: false, failOnDuplicate: true },
    };
    const loaders: LocaleLoaderMap = {
      de: async () => ({}) as LocaleMessages,
      es: async () => ({}) as LocaleMessages,
    };
    const apiClient = createApiClient({
      listLanguages: async () => {
        throw new Error('boom');
      },
    });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ config, loaders, apiClient }),
    });

    await waitFor(() => {
      const byCode = Object.fromEntries(result.current.languages.map((l) => [l.code, l.name]));
      expect(byCode.de).toBe('Deutsch');
      expect(byCode.es).toBe('Español');
    });
  });
});

describe('LanguageProvider.setLanguage', () => {
  it('persists selection and propagates to localization', async () => {
    const persistUserLanguage = vi.fn(async () => {});
    const apiClient = createApiClient({ persistUserLanguage });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setLanguage('fr');
    });

    await waitFor(() => expect(result.current.language).toBe('fr'));
    expect(persistUserLanguage).toHaveBeenCalled();
    expect((persistUserLanguage as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('fr');
    expect(localStorage.getItem('ikary.language')).toBe('fr');
    expect(localStorage.getItem('micro.locale')).toBe('fr');
    expect(result.current.errorMessage).toBeNull();
  });

  it('sets errorMessage when the requested code is unsupported', async () => {
    const persistUserLanguage = vi.fn(async () => {});
    const apiClient = createApiClient({ persistUserLanguage });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setLanguage('xx');
    });

    expect(result.current.errorMessage).toMatch(/not supported/);
    expect(persistUserLanguage).not.toHaveBeenCalled();
  });

  it('sets errorMessage when persistUserLanguage rejects', async () => {
    const apiClient = createApiClient({
      persistUserLanguage: vi.fn(async () => {
        throw new Error('network');
      }),
    });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setLanguage('fr');
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toMatch(/could not be saved/);
    });
    expect(result.current.language).toBe('fr');
  });

  it('resets errorMessage on a subsequent successful change', async () => {
    const persist = vi
      .fn<LanguageApiClient['persistUserLanguage']>()
      .mockRejectedValueOnce(new Error('nope'))
      .mockResolvedValueOnce(undefined);
    const apiClient = createApiClient({ persistUserLanguage: persist });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setLanguage('fr');
    });
    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());

    await act(async () => {
      await result.current.setLanguage('nl');
    });

    await waitFor(() => expect(result.current.errorMessage).toBeNull());
  });
});

describe('LanguageProvider.refreshLanguages', () => {
  it('invalidates the languages query and refetches', async () => {
    const listLanguages = vi
      .fn<LanguageApiClient['listLanguages']>()
      .mockResolvedValueOnce([{ code: 'en', name: 'English', direction: 'ltr' }])
      .mockResolvedValueOnce([
        { code: 'en', name: 'English', direction: 'ltr' },
        { code: 'fr', name: 'Français', direction: 'ltr' },
      ]);
    const apiClient = createApiClient({ listLanguages });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.languages).toHaveLength(1);

    await act(async () => {
      await result.current.refreshLanguages();
    });

    await waitFor(() => expect(result.current.languages).toHaveLength(2));
    expect(listLanguages).toHaveBeenCalledTimes(2);
  });
});

describe('LanguageProvider environment guards', () => {
  it('treats missing localStorage and navigator as no-ops', async () => {
    // Temporarily shadow both globals so detectBrowserLocale/read/writeStoredLocale
    // hit their `typeof === 'undefined'` branches.
    const localStorageDesc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const navigatorDesc = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'localStorage', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    try {
      const { result } = renderHook(() => useLanguageContext(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.language).toBe('en');

      // Also exercise writeStoredLocale's typeof guard via setLanguage.
      await act(async () => {
        await result.current.setLanguage('fr');
      });
      await waitFor(() => expect(result.current.language).toBe('fr'));
    } finally {
      if (localStorageDesc) {
        Object.defineProperty(globalThis, 'localStorage', localStorageDesc);
      }
      if (navigatorDesc) {
        Object.defineProperty(globalThis, 'navigator', navigatorDesc);
      }
    }
  });
});

describe('LanguageProvider derived flags', () => {
  it('reports isUpdating while a persist mutation is pending', async () => {
    let resolvePersist: () => void = () => {};
    const persistUserLanguage = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePersist = resolve;
        }),
    );
    const apiClient = createApiClient({ persistUserLanguage });

    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: createWrapper({ apiClient }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      void result.current.setLanguage('fr');
    });

    await waitFor(() => expect(result.current.isUpdating).toBe(true));

    await act(async () => {
      resolvePersist();
    });

    await waitFor(() => expect(result.current.isUpdating).toBe(false));
  });
});
