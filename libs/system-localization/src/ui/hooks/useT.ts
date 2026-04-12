import type { MessageDescriptor } from '../../shared/index';
import { useIntl, type PrimitiveType } from 'react-intl';
import { useLocalization } from '../LocalizationProvider';

type TranslationValues = Record<string, PrimitiveType>;

export type TranslateFn = (id: MessageDescriptor['id'] | string, values?: TranslationValues) => string;

export function useT(): TranslateFn {
  const intl = useIntl();
  const { defaultMessages } = useLocalization();

  return (id, values) => {
    const defaultMessage = defaultMessages[id] ?? id;
    return intl.formatMessage({ id, defaultMessage }, values);
  };
}
