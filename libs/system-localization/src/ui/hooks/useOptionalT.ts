import type { PrimitiveType } from 'react-intl';
import type { LocaleMessages, MessageDescriptor } from '../../shared/index';
import { useOptionalLocalization } from '../LocalizationProvider';

type TranslationValues = Record<string, PrimitiveType>;

export type TranslateFn = (id: MessageDescriptor['id'] | string, values?: TranslationValues) => string;

/**
 * Simple ICU-style `{var}` interpolation used when no LocalizationProvider
 * is present. Replaces `{name}` placeholders with values from the `values`
 * map. Missing placeholders are left as-is.
 */
function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? match : String(value);
  });
}

/**
 * Translation hook that works with or without a `LocalizationProvider`.
 *
 * When a provider is mounted, the returned function resolves keys in this
 * order: active-locale messages → default-locale messages → fallback map →
 * raw id. That lets cell-level overrides AND non-default locales take
 * effect. When no provider is mounted, falls back to `fallbackMessages`
 * with simple `{var}` interpolation.
 *
 * Libraries use this so host apps stay compatible whether or not they've
 * adopted the provider.
 *
 * @example
 * const t = useOptionalT(rendererEnMessages);
 * t('entity.detail.edit_button'); // "Edit"
 * t('entity.list.create_button', { entityName: 'Order' }); // "Create Order"
 */
export function useOptionalT(fallbackMessages: Readonly<LocaleMessages>): TranslateFn {
  const localization = useOptionalLocalization();
  return (id, values) => {
    const template =
      localization?.messages[id] ?? localization?.defaultMessages[id] ?? fallbackMessages[id] ?? id;
    return interpolate(template, values);
  };
}
