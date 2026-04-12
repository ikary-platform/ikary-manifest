import { useLocalization } from '../LocalizationProvider';
import { useT, type TranslateFn } from './useT';

export interface UseTranslationResult {
  t: TranslateFn;
  locale: string;
  defaultLocale: string;
  supportedLocales: readonly string[];
  setLocale: (locale: string) => Promise<void>;
  isLoading: boolean;
}

export function useTranslation(): UseTranslationResult {
  const t = useT();
  const localization = useLocalization();

  return {
    t,
    locale: localization.locale,
    defaultLocale: localization.defaultLocale,
    supportedLocales: localization.supportedLocales,
    setLocale: localization.setLocale,
    isLoading: localization.isLoading,
  };
}
