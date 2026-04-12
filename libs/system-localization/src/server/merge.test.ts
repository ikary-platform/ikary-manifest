import { describe, it, expect } from 'vitest';
import { mergeLocaleCatalog, buildScaffoldLocale } from './merge';
import type { MessageSource } from '../shared/index';

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

describe('mergeLocaleCatalog', () => {
  it('returns a catalog with the provided locale and merged messages', () => {
    const sources: MessageSource[] = [
      makeSource({ messages: { 'auth.login': 'Login' } }),
      makeSource({
        packageName: 'pkg-b',
        filePath: '/b/en.ts',
        messages: { 'workspace.title': 'Workspace' },
      }),
    ];

    const result = mergeLocaleCatalog('en', sources);

    expect(result.locale).toBe('en');
    expect(result.messages['auth.login']).toBe('Login');
    expect(result.messages['workspace.title']).toBe('Workspace');
    expect(result.duplicates).toEqual([]);
    expect(result.sources).toBe(sources);
  });

  it('allows override layer to replace existing values without producing duplicates', () => {
    const sources: MessageSource[] = [
      makeSource({ layer: 'library', messages: { 'auth.login': 'Login base' } }),
      makeSource({
        packageName: 'z-overrides',
        filePath: '/z/en.ts',
        layer: 'override',
        messages: { 'auth.login': 'Login overridden' },
      }),
    ];

    const result = mergeLocaleCatalog('en', sources);

    expect(result.duplicates).toEqual([]);
    expect(result.messages['auth.login']).toBe('Login overridden');
  });

  it('flags duplicates from non-override layers', () => {
    const sources: MessageSource[] = [
      makeSource({ messages: { 'auth.login': 'v1' } }),
      makeSource({ packageName: 'pkg-b', filePath: '/b/en.ts', messages: { 'auth.login': 'v2' } }),
    ];

    const result = mergeLocaleCatalog('en', sources);

    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].id).toBe('auth.login');
  });

  it('returns empty catalog for empty source list', () => {
    const result = mergeLocaleCatalog('fr', []);

    expect(result.locale).toBe('fr');
    expect(result.messages).toEqual({});
    expect(result.duplicates).toEqual([]);
    expect(result.sources).toEqual([]);
  });
});

describe('buildScaffoldLocale', () => {
  it('returns all reference keys with translated values when present', () => {
    const reference = { 'a.b': 'A', 'c.d': 'C' };
    const translated = { 'a.b': 'Aa' };

    const result = buildScaffoldLocale(reference, translated);

    expect(result['a.b']).toBe('Aa');
    expect(result['c.d']).toBe('');
  });

  it('returns keys sorted alphabetically', () => {
    const reference = { 'z.z': 'Z', 'a.a': 'A' };
    const result = buildScaffoldLocale(reference, {});

    expect(Object.keys(result)).toEqual(['a.a', 'z.z']);
  });

  it('returns empty object when reference is empty', () => {
    expect(buildScaffoldLocale({}, {})).toEqual({});
  });
});
