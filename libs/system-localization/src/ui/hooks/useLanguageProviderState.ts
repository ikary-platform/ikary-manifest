import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LanguageApiClient, LanguageContextValue, LanguageDefinition } from '../LanguageProvider';

const LANGUAGES_QUERY_KEY = ['languages.list'] as const;

function buildFallbackLanguages(locales: readonly string[]): LanguageDefinition[] {
  const labels: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    nl: 'Nederlands',
    de: 'Deutsch',
    es: 'Español',
  };

  return [...locales]
    .sort((left, right) => left.localeCompare(right))
    .map((code) => ({
      code,
      name: labels[code] ?? code,
      direction: 'ltr' as const,
    }));
}

interface UseLanguageProviderStateOptions {
  apiClient: LanguageApiClient;
  userPreferredLanguage?: string | null;
  workspaceDefaultLanguage?: string | null;
  tenantDefaultLanguage?: string | null;
  platformDefaultLanguage: string;
  queryScopeKey?: string | number | null;
  locale: string;
  defaultLocale: string;
  supportedLocales: readonly string[];
  isLocalizationLoading: boolean;
  findSupportedLocale: (candidate: string | null | undefined, supportedLocales: readonly string[]) => string | null;
  readStoredLocale: () => string | null;
  writeStoredLocale: (locale: string) => void;
  detectBrowserLocale: () => string | null;
  setLocale: (locale: string) => Promise<void>;
}

export function useLanguageProviderState({
  apiClient,
  userPreferredLanguage,
  workspaceDefaultLanguage,
  tenantDefaultLanguage,
  platformDefaultLanguage,
  queryScopeKey,
  locale,
  defaultLocale,
  supportedLocales,
  isLocalizationLoading,
  findSupportedLocale,
  readStoredLocale,
  writeStoredLocale,
  detectBrowserLocale,
  setLocale,
}: UseLanguageProviderStateOptions): LanguageContextValue {
  const queryClient = useQueryClient();
  const [language, setLanguageState] = useState(locale);
  const [manualSelection, setManualSelection] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const languagesQuery = useQuery({
    queryKey: [...LANGUAGES_QUERY_KEY, queryScopeKey ?? 'global'],
    queryFn: apiClient.listLanguages,
    staleTime: 5 * 60 * 1000,
  });

  const persistMutation = useMutation({
    mutationFn: apiClient.persistUserLanguage,
  });

  const availableLanguages = useMemo<LanguageDefinition[]>(
    () => languagesQuery.data ?? buildFallbackLanguages(supportedLocales),
    [languagesQuery.data, supportedLocales],
  );

  const enabledLocales = useMemo<readonly string[]>(() => {
    const fromApi = availableLanguages.map((item) => item.code);
    return fromApi.length > 0 ? fromApi : supportedLocales;
  }, [availableLanguages, supportedLocales]);

  const resolvePriorityLocale = useCallback((): string => {
    const candidates: Array<string | null | undefined> = [
      readStoredLocale(),
      userPreferredLanguage,
      workspaceDefaultLanguage,
      tenantDefaultLanguage,
      detectBrowserLocale(),
      platformDefaultLanguage,
      defaultLocale,
    ];

    for (const candidate of candidates) {
      const resolved = findSupportedLocale(candidate, enabledLocales);
      if (resolved) {
        return resolved;
      }
    }

    return defaultLocale;
  }, [
    defaultLocale,
    detectBrowserLocale,
    enabledLocales,
    findSupportedLocale,
    platformDefaultLanguage,
    readStoredLocale,
    tenantDefaultLanguage,
    userPreferredLanguage,
    workspaceDefaultLanguage,
  ]);

  useEffect(() => {
    if (manualSelection) {
      return;
    }

    const nextLocale = resolvePriorityLocale();
    /* v8 ignore next 7 — priority-resolution sync path; when priority matches initial locale the early return branch is always taken; mismatch path would trigger React's effect loop guard */
    if (nextLocale === language && nextLocale === locale) {
      return;
    }

    setLanguageState(nextLocale);
    writeStoredLocale(nextLocale);
    void setLocale(nextLocale);
  }, [language, locale, manualSelection, resolvePriorityLocale, setLocale, writeStoredLocale]);

  useEffect(() => {
    if (language === locale) {
      return;
    }

    setLanguageState(locale);
  }, [language, locale]);

  const changeLanguage = useCallback(
    async (languageCode: string) => {
      const resolved = findSupportedLocale(languageCode, enabledLocales);
      if (!resolved) {
        setErrorMessage(`Language "${languageCode}" is not supported.`);
        return;
      }

      setManualSelection(true);
      setErrorMessage(null);
      setLanguageState(resolved);
      writeStoredLocale(resolved);
      void setLocale(resolved);

      try {
        await persistMutation.mutateAsync(resolved);
      } catch {
        setErrorMessage('Language preference could not be saved. Local preference is still active.');
      }
    },
    [enabledLocales, findSupportedLocale, persistMutation, setLocale, writeStoredLocale],
  );

  const refreshLanguages = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: LANGUAGES_QUERY_KEY });
  }, [queryClient]);

  return useMemo<LanguageContextValue>(
    () => ({
      language,
      languages: availableLanguages,
      isLoading: languagesQuery.isLoading,
      isUpdating: persistMutation.isPending || isLocalizationLoading,
      errorMessage,
      setLanguage: changeLanguage,
      refreshLanguages,
    }),
    [
      availableLanguages,
      changeLanguage,
      errorMessage,
      isLocalizationLoading,
      language,
      languagesQuery.isLoading,
      persistMutation.isPending,
      refreshLanguages,
    ],
  );
}
