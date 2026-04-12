import { describe, it, expect } from 'vitest';
import { validateDuplicates, validateLocaleKeys } from './validate';
import type { DuplicateMessage, MessageSource, LocaleMessages } from '../shared/index';

function makeSource(overrides: Partial<MessageSource> = {}): MessageSource {
  return {
    packageName: 'pkg-a',
    locale: 'en',
    filePath: '/a/en.ts',
    layer: 'library',
    messages: {},
    ...overrides,
  };
}

function makeDuplicate(overrides: Partial<DuplicateMessage> = {}): DuplicateMessage {
  return {
    id: 'auth.login',
    incomingSource: makeSource({ filePath: '/pkg-b/en.ts', packageName: 'pkg-b' }),
    existingSource: makeSource({ filePath: '/pkg-a/en.ts', packageName: 'pkg-a' }),
    ...overrides,
  };
}

describe('validateDuplicates', () => {
  it('returns an empty array when there are no duplicates', () => {
    expect(
      validateDuplicates([], { failOnMissing: false, failOnDuplicate: true }),
    ).toEqual([]);
  });

  it('produces error-level issues when failOnDuplicate is true', () => {
    const duplicates = [makeDuplicate()];
    const issues = validateDuplicates(duplicates, {
      failOnMissing: false,
      failOnDuplicate: true,
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('error');
    expect(issues[0].locale).toBe('en');
    expect(issues[0].message).toContain('auth.login');
    expect(issues[0].message).toContain('/pkg-b/en.ts');
    expect(issues[0].message).toContain('/pkg-a/en.ts');
  });

  it('produces warning-level issues when failOnDuplicate is false', () => {
    const duplicates = [makeDuplicate()];
    const issues = validateDuplicates(duplicates, {
      failOnMissing: false,
      failOnDuplicate: false,
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('warning');
  });

  it('maps every duplicate to its incoming locale', () => {
    const duplicates = [
      makeDuplicate({ incomingSource: makeSource({ locale: 'fr', filePath: '/pkg-b/fr.ts' }) }),
      makeDuplicate({ incomingSource: makeSource({ locale: 'de', filePath: '/pkg-c/de.ts' }) }),
    ];
    const issues = validateDuplicates(duplicates, {
      failOnMissing: false,
      failOnDuplicate: true,
    });

    expect(issues.map((issue) => issue.locale)).toEqual(['fr', 'de']);
  });
});

describe('validateLocaleKeys', () => {
  it('returns no issues when reference and candidate have identical keys', () => {
    const reference: LocaleMessages = { 'a.b': 'A', 'c.d': 'C' };
    const candidate: LocaleMessages = { 'a.b': 'Ax', 'c.d': 'Cx' };

    expect(
      validateLocaleKeys(reference, candidate, 'fr', {
        failOnMissing: false,
        failOnDuplicate: true,
      }),
    ).toEqual([]);
  });

  it('marks missing keys as error when failOnMissing is true', () => {
    const reference: LocaleMessages = { 'a.b': 'A', 'c.d': 'C' };
    const candidate: LocaleMessages = { 'a.b': 'Ax' };
    const issues = validateLocaleKeys(reference, candidate, 'fr', {
      failOnMissing: true,
      failOnDuplicate: true,
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('error');
    expect(issues[0].locale).toBe('fr');
    expect(issues[0].message).toContain('Missing 1 keys in fr');
    expect(issues[0].message).toContain('c.d');
  });

  it('marks missing keys as warning when failOnMissing is false', () => {
    const reference: LocaleMessages = { 'a.b': 'A', 'c.d': 'C' };
    const candidate: LocaleMessages = { 'a.b': 'Ax' };
    const issues = validateLocaleKeys(reference, candidate, 'fr', {
      failOnMissing: false,
      failOnDuplicate: true,
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('warning');
  });

  it('always marks extra keys as error', () => {
    const reference: LocaleMessages = { 'a.b': 'A' };
    const candidate: LocaleMessages = { 'a.b': 'Ax', 'z.z': 'Z' };
    const issues = validateLocaleKeys(reference, candidate, 'fr', {
      failOnMissing: false,
      failOnDuplicate: true,
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('error');
    expect(issues[0].message).toContain('Unexpected 1 keys');
    expect(issues[0].message).toContain('z.z');
  });

  it('reports both missing and extra key issues', () => {
    const reference: LocaleMessages = { 'a.b': 'A', 'c.d': 'C' };
    const candidate: LocaleMessages = { 'a.b': 'Ax', 'z.z': 'Z' };
    const issues = validateLocaleKeys(reference, candidate, 'fr', {
      failOnMissing: true,
      failOnDuplicate: true,
    });

    expect(issues).toHaveLength(2);
    expect(issues[0].message).toContain('Missing');
    expect(issues[1].message).toContain('Unexpected');
  });
});
