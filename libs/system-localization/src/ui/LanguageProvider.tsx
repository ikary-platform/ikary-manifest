import React, { createContext, useContext } from 'react';
import { useLocalization } from './LocalizationProvider';
import { useLanguageProviderState } from './hooks/useLanguageProviderState';

const PRIMARY_STORAGE_KEY = 'ikary.language';
const LEGACY_STORAGE_KEY = 'micro.locale';
export interface LanguageDefinition {
  code: string;
  name: string;
  direction?: 'ltr' | 'rtl';
}

export interface LanguageApiClient {
  listLanguages: () => Promise<LanguageDefinition[]>;
  persistUserLanguage: (language: string) => Promise<void>;
}

export interface LanguageProviderProps {
  children: React.ReactNode;
  apiClient: LanguageApiClient;
  userPreferredLanguage?: string | null;
  workspaceDefaultLanguage?: string | null;
  tenantDefaultLanguage?: string | null;
  platformDefaultLanguage?: string;
  queryScopeKey?: string | number | null;
}

export interface LanguageContextValue {
  language: string;
  languages: LanguageDefinition[];
  isLoading: boolean;
  isUpdating: boolean;
  errorMessage: string | null;
  setLanguage: (languageCode: string) => Promise<void>;
  refreshLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function normalizeLocaleCode(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const normalized = input.trim().replace('_', '-');
  if (normalized.length === 0) {
    return null;
  }

  const [base, region] = normalized.split('-');
  if (!base) {
    return null;
  }

  const safeBase = base.toLowerCase();
  if (!region) {
    return safeBase;
  }

  return `${safeBase}-${region.toUpperCase()}`;
}

function findSupportedLocale(candidate: string | null | undefined, supportedLocales: readonly string[]): string | null {
  const normalized = normalizeLocaleCode(candidate);
  if (!normalized) {
    return null;
  }

  if (supportedLocales.includes(normalized)) {
    return normalized;
  }

  const [base] = normalized.split('-');
  if (base && supportedLocales.includes(base)) {
    return base;
  }

  return null;
}

function readStoredLocale(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return (
    normalizeLocaleCode(localStorage.getItem(PRIMARY_STORAGE_KEY)) ??
    normalizeLocaleCode(localStorage.getItem(LEGACY_STORAGE_KEY))
  );
}

function writeStoredLocale(locale: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(PRIMARY_STORAGE_KEY, locale);
  localStorage.setItem(LEGACY_STORAGE_KEY, locale);
}

function detectBrowserLocale(): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  for (const language of navigator.languages ?? []) {
    const normalized = normalizeLocaleCode(language);
    if (normalized) {
      return normalized;
    }
  }

  return normalizeLocaleCode(navigator.language);
}

export function LanguageProvider({
  children,
  apiClient,
  userPreferredLanguage,
  workspaceDefaultLanguage,
  tenantDefaultLanguage,
  platformDefaultLanguage = 'en',
  queryScopeKey,
}: LanguageProviderProps) {
  const localization = useLocalization();
  const contextValue = useLanguageProviderState({
    apiClient,
    userPreferredLanguage,
    workspaceDefaultLanguage,
    tenantDefaultLanguage,
    platformDefaultLanguage,
    queryScopeKey,
    locale: localization.locale,
    defaultLocale: localization.defaultLocale,
    supportedLocales: localization.supportedLocales,
    isLocalizationLoading: localization.isLoading,
    findSupportedLocale,
    readStoredLocale,
    writeStoredLocale,
    detectBrowserLocale,
    setLocale: localization.setLocale,
  });

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider.');
  }

  return context;
}
