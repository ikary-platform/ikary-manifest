import { diffLocaleKeys, type DuplicateMessage, type LocaleMessages } from '../shared/index';

export interface LocaleValidationIssue {
  locale: string;
  level: 'warning' | 'error';
  message: string;
}

export interface ValidationOptions {
  failOnMissing: boolean;
  failOnDuplicate: boolean;
}

export function validateDuplicates(
  duplicates: DuplicateMessage[],
  options: ValidationOptions,
): LocaleValidationIssue[] {
  if (duplicates.length === 0) {
    return [];
  }

  return duplicates.map((duplicate) => ({
    locale: duplicate.incomingSource.locale,
    level: options.failOnDuplicate ? 'error' : 'warning',
    message: `Duplicate message id ${duplicate.id} from ${duplicate.incomingSource.filePath} conflicts with ${duplicate.existingSource.filePath}.`,
  }));
}

export function validateLocaleKeys(
  reference: LocaleMessages,
  candidate: LocaleMessages,
  locale: string,
  options: ValidationOptions,
): LocaleValidationIssue[] {
  const diff = diffLocaleKeys(reference, candidate);
  const issues: LocaleValidationIssue[] = [];

  if (diff.missingKeys.length > 0) {
    issues.push({
      locale,
      level: options.failOnMissing ? 'error' : 'warning',
      message: `Missing ${diff.missingKeys.length} keys in ${locale}: ${diff.missingKeys.join(', ')}`,
    });
  }

  if (diff.extraKeys.length > 0) {
    issues.push({
      locale,
      level: 'error',
      message: `Unexpected ${diff.extraKeys.length} keys in ${locale}: ${diff.extraKeys.join(', ')}`,
    });
  }

  return issues;
}
