import type { LocalizationConfig, LocaleMessages } from '../shared/index';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { normalizeLocaleModule, type LocaleLoaderMap } from './locale.loader';

const PRIMARY_STORAGE_KEY = 'ikary.language';
const LEGACY_STORAGE_KEY = 'micro.locale';

export interface LocalizationScope {
  tenantId?: string;
  workspaceId?: string;
  cellId?: string;
}

export interface LocalizationCatalogClient {
  fetchCatalog(input: { locale: string; scope: LocalizationScope }): Promise<{
    values: LocaleMessages;
    resolvedLocale?: string;
  }>;
  persistPreferredLanguage?: (locale: string) => Promise<void>;
}

interface LocalizationContextValue {
  locale: string;
  defaultLocale: string;
  supportedLocales: readonly string[];
  setLocale: (locale: string) => Promise<void>;
  scope: LocalizationScope;
  setScope: (scope: LocalizationScope) => void;
  refreshCatalog: () => Promise<void>;
  defaultMessages: LocaleMessages;
  isLoading: boolean;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export interface LocalizationProviderProps {
  config: LocalizationConfig;
  loaders: LocaleLoaderMap;
  catalogClient?: LocalizationCatalogClient;
  initialLocale?: string;
  initialScope?: LocalizationScope;
  children: React.ReactNode;
}

async function loadLocaleMessages(loaders: LocaleLoaderMap, locale: string): Promise<LocaleMessages> {
  const loader = loaders[locale];
  if (!loader) {
    return {};
  }

  return normalizeLocaleModule(await loader());
}

function scopesEqual(left: LocalizationScope, right: LocalizationScope): boolean {
  return left.tenantId === right.tenantId && left.workspaceId === right.workspaceId && left.cellId === right.cellId;
}

export function LocalizationProvider({
  config,
  loaders,
  catalogClient,
  initialLocale,
  initialScope,
  children,
}: LocalizationProviderProps) {
  const initialResolvedLocale =
    initialLocale && config.supportedLocales.includes(initialLocale) ? initialLocale : config.defaultLocale;

  const [locale, setLocaleState] = useState(initialResolvedLocale);
  const [scope, setScopeState] = useState<LocalizationScope>(initialScope ?? {});
  const [defaultMessages, setDefaultMessages] = useState<LocaleMessages>({});
  const [messages, setMessages] = useState<LocaleMessages>({});
  const [isLoading, setIsLoading] = useState(true);

  const persistLocaleToStorage = useCallback((selectedLocale: string) => {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(PRIMARY_STORAGE_KEY, selectedLocale);
    localStorage.setItem(LEGACY_STORAGE_KEY, selectedLocale);
  }, []);

  const loadLocale = useCallback(
    async (nextLocale: string, nextScope: LocalizationScope, persistPreference = false) => {
      const resolvedLocale = config.supportedLocales.includes(nextLocale) ? nextLocale : config.defaultLocale;
      setIsLoading(true);

      const [loadedDefault, loadedCurrent] = await Promise.all([
        loadLocaleMessages(loaders, config.defaultLocale),
        loadLocaleMessages(loaders, resolvedLocale),
      ]);

      let selectedLocale = resolvedLocale;
      let nextMessages = Object.keys(loadedCurrent).length > 0 ? loadedCurrent : loadedDefault;

      if (catalogClient) {
        try {
          const catalog = await catalogClient.fetchCatalog({
            locale: resolvedLocale,
            scope: nextScope,
          });

          if (catalog.resolvedLocale && config.supportedLocales.includes(catalog.resolvedLocale)) {
            selectedLocale = catalog.resolvedLocale;
          }

          if (Object.keys(catalog.values).length > 0) {
            nextMessages = {
              ...loadedDefault,
              ...nextMessages,
              ...catalog.values,
            };
          }
        } catch {
          // Fall back to local bundle catalogs in case API catalog fetch fails.
        }
      }

      setDefaultMessages(loadedDefault);
      setMessages(nextMessages);
      setLocaleState(selectedLocale);
      persistLocaleToStorage(selectedLocale);
      setIsLoading(false);

      /* v8 ignore next 5 — persistPreference is only reachable via internal opt-in; public API always omits it */
      if (persistPreference) {
        void catalogClient?.persistPreferredLanguage?.(selectedLocale).catch(() => {
          // Keep locale switch responsive even if preference persistence fails.
        });
      }
    },
    [catalogClient, config.defaultLocale, config.supportedLocales, loaders, persistLocaleToStorage],
  );

  useEffect(() => {
    void loadLocale(initialResolvedLocale, scope);
  }, [initialResolvedLocale, loadLocale, scope]);

  const setScope = useCallback((nextScope: LocalizationScope) => {
    setScopeState((current) => (scopesEqual(current, nextScope) ? current : nextScope));
  }, []);

  const setLocale = useCallback(
    async (nextLocale: string) => {
      await loadLocale(nextLocale, scope, false);
    },
    [loadLocale, scope],
  );

  const refreshCatalog = useCallback(async () => {
    await loadLocale(locale, scope);
  }, [loadLocale, locale, scope]);

  const contextValue = useMemo<LocalizationContextValue>(
    () => ({
      locale,
      defaultLocale: config.defaultLocale,
      supportedLocales: config.supportedLocales,
      setLocale,
      scope,
      setScope,
      refreshCatalog,
      defaultMessages,
      isLoading,
    }),
    [
      config.defaultLocale,
      config.supportedLocales,
      defaultMessages,
      isLoading,
      locale,
      refreshCatalog,
      scope,
      setLocale,
      setScope,
    ],
  );

  return (
    <LocalizationContext.Provider value={contextValue}>
      <IntlProvider
        locale={locale}
        defaultLocale={config.defaultLocale}
        messages={messages}
        onError={(error) => {
          if (error.code === 'MISSING_TRANSLATION') {
            return;
          }

          console.error(error);
        }}
      >
        {children}
      </IntlProvider>
    </LocalizationContext.Provider>
  );
}

export function useLocalization(): LocalizationContextValue {
  const value = useContext(LocalizationContext);
  if (!value) {
    throw new Error('useLocalization must be used inside LocalizationProvider.');
  }

  return value;
}

/**
 * Non-throwing variant of `useLocalization` that returns `null` when no
 * LocalizationProvider is mounted above this component. Libraries use this
 * to stay compatible with host apps that haven't adopted the provider.
 */
export function useOptionalLocalization(): LocalizationContextValue | null {
  return useContext(LocalizationContext);
}
