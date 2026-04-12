import { useLanguageContext, type LanguageContextValue } from '../LanguageProvider';

export type { LanguageContextValue };

export function useLanguage(): LanguageContextValue {
  return useLanguageContext();
}
