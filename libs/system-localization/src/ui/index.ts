export {
  LocalizationProvider,
  useLocalization,
  useOptionalLocalization,
  type LocalizationProviderProps,
  type LocalizationScope,
  type LocalizationCatalogClient,
} from './LocalizationProvider';

export {
  LanguageProvider,
  type LanguageApiClient,
  type LanguageDefinition,
  type LanguageProviderProps,
} from './LanguageProvider';

export { useLanguage } from './hooks/useLanguage';
export { T, type TProps } from './T';
export { useT, type TranslateFn } from './hooks/useT';
export { useOptionalT } from './hooks/useOptionalT';
export { useTranslation, type UseTranslationResult } from './hooks/useTranslation';

export {
  createLocaleLoaders,
  normalizeLocaleModule,
  type LocaleLoader,
  type LocaleLoaderMap,
  type LocaleModule,
} from './locale.loader';
