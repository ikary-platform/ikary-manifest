export {
  localeCodeSchema,
  localeMessagesSchema,
  messageIdSchema,
  type LocaleCode,
  type LocaleMessages,
  type MessageDescriptor,
  type MessageId,
} from './message.types';

export {
  defineLocalizationConfig,
  localizationConfigSchema,
  localizationValidationSchema,
  type LocalizationConfig,
  type LocalizationValidationConfig,
} from './config.types';

export {
  createLocaleScaffold,
  diffLocaleKeys,
  mergeMessageSources,
  type DuplicateMessage,
  type LocaleDiffResult,
  type MergeOptions,
  type MergeResult,
  type MessageSource,
} from './registry';
