import { describe, it, expect } from 'vitest';
import { mergeMessageSources, diffLocaleKeys, createLocaleScaffold, type MessageSource } from './registry';

function makeSource(overrides: Partial<MessageSource> = {}): MessageSource {
  return {
    packageName: 'pkg-a',
    locale: 'en',
    filePath: '/a/en.json',
    layer: 'library',
    messages: {},
    ...overrides,
  };
}

describe('mergeMessageSources', () => {
  it('merges messages from multiple sources', () => {
    const sources: MessageSource[] = [
      makeSource({ messages: { 'auth.login': 'Login' } }),
      makeSource({ packageName: 'pkg-b', filePath: '/b/en.json', messages: { 'workspace.title': 'Workspace' } }),
    ];
    const result = mergeMessageSources(sources);
    expect(result.messages['auth.login']).toBe('Login');
    expect(result.messages['workspace.title']).toBe('Workspace');
    expect(result.duplicates).toHaveLength(0);
  });

  it('sorts merged messages alphabetically', () => {
    const sources: MessageSource[] = [makeSource({ messages: { 'z.last': 'Last', 'a.first': 'First' } })];
    const result = mergeMessageSources(sources);
    const keys = Object.keys(result.messages);
    expect(keys[0]).toBe('a.first');
    expect(keys[1]).toBe('z.last');
  });

  it('detects duplicates from same layer', () => {
    const sources: MessageSource[] = [
      makeSource({ messages: { 'auth.login': 'Login v1' } }),
      makeSource({ packageName: 'pkg-b', filePath: '/b/en.json', messages: { 'auth.login': 'Login v2' } }),
    ];
    const result = mergeMessageSources(sources);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].id).toBe('auth.login');
  });

  it('allows override layer to replace existing messages', () => {
    // 'pkg-a' sorts before 'z-override', so the library source is processed first
    const sources: MessageSource[] = [
      makeSource({ messages: { 'auth.login': 'Original' } }),
      makeSource({
        packageName: 'z-override',
        filePath: '/z/en.json',
        layer: 'override',
        messages: { 'auth.login': 'Custom' },
      }),
    ];
    const result = mergeMessageSources(sources);
    expect(result.messages['auth.login']).toBe('Custom');
    expect(result.duplicates).toHaveLength(0);
  });

  it('tracks provenance for each message', () => {
    const source = makeSource({ messages: { 'auth.login': 'Login' } });
    const result = mergeMessageSources([source]);
    expect(result.provenance['auth.login']).toBe(source);
  });

  it('returns empty result for no sources', () => {
    const result = mergeMessageSources([]);
    expect(result.messages).toEqual({});
    expect(result.duplicates).toEqual([]);
  });

  it('respects allowOverridesFromLayer option', () => {
    // 'app' sorts before 'pkg-a', so library source arrives second and gets flagged
    // unless we use allowOverridesFromLayer=['library'] to let it override
    const sources: MessageSource[] = [
      makeSource({ packageName: 'pkg-core', layer: 'core', messages: { 'auth.login': 'Core' } }),
      makeSource({
        packageName: 'pkg-lib',
        filePath: '/lib/en.json',
        layer: 'library',
        messages: { 'auth.login': 'Lib' },
      }),
    ];
    const result = mergeMessageSources(sources, { allowOverridesFromLayer: ['library'] });
    expect(result.messages['auth.login']).toBe('Lib');
    expect(result.duplicates).toHaveLength(0);
  });
});

describe('diffLocaleKeys', () => {
  it('finds missing keys', () => {
    const reference = { 'auth.login': 'Login', 'auth.logout': 'Logout' };
    const candidate = { 'auth.login': 'Connexion' };
    const result = diffLocaleKeys(reference, candidate);
    expect(result.missingKeys).toEqual(['auth.logout']);
    expect(result.extraKeys).toEqual([]);
  });

  it('finds extra keys', () => {
    const reference = { 'auth.login': 'Login' };
    const candidate = { 'auth.login': 'Connexion', 'auth.extra': 'Extra' };
    const result = diffLocaleKeys(reference, candidate);
    expect(result.missingKeys).toEqual([]);
    expect(result.extraKeys).toEqual(['auth.extra']);
  });

  it('returns empty when both match', () => {
    const msgs = { 'auth.login': 'Login' };
    const result = diffLocaleKeys(msgs, msgs);
    expect(result.missingKeys).toEqual([]);
    expect(result.extraKeys).toEqual([]);
  });

  it('sorts results alphabetically', () => {
    const reference = { 'z.key': 'Z', 'a.key': 'A' };
    const candidate = {};
    const result = diffLocaleKeys(reference, candidate);
    expect(result.missingKeys).toEqual(['a.key', 'z.key']);
  });
});

describe('createLocaleScaffold', () => {
  it('creates scaffold with empty strings for new keys', () => {
    const reference = { 'auth.login': 'Login', 'auth.logout': 'Logout' };
    const result = createLocaleScaffold(reference);
    expect(result['auth.login']).toBe('');
    expect(result['auth.logout']).toBe('');
  });

  it('fills in existing translations', () => {
    const reference = { 'auth.login': 'Login', 'auth.logout': 'Logout' };
    const existing = { 'auth.login': 'Connexion' };
    const result = createLocaleScaffold(reference, existing);
    expect(result['auth.login']).toBe('Connexion');
    expect(result['auth.logout']).toBe('');
  });

  it('drops extra keys not in reference', () => {
    const reference = { 'auth.login': 'Login' };
    const existing = { 'auth.login': 'Connexion', 'auth.extra': 'Extra' };
    const result = createLocaleScaffold(reference, existing);
    expect(Object.keys(result)).toEqual(['auth.login']);
  });

  it('sorts result alphabetically', () => {
    const reference = { 'z.key': 'Z', 'a.key': 'A' };
    const result = createLocaleScaffold(reference);
    expect(Object.keys(result)).toEqual(['a.key', 'z.key']);
  });
});

describe('mergeMessageSources — sort branches', () => {
  it('sorts by filePath when packageName is equal', () => {
    // Exercise the fileOrder branch — same package, different file paths
    const sources: MessageSource[] = [
      makeSource({ packageName: 'pkg', filePath: '/b/en.json', messages: { 'a.key': 'from-b' } }),
      makeSource({ packageName: 'pkg', filePath: '/a/en.json', messages: { 'a.key': 'from-a' } }),
    ];
    const result = mergeMessageSources(sources);
    // '/a/en.json' sorts before '/b/en.json', so it wins; '/b/en.json' is flagged as duplicate
    expect(result.messages['a.key']).toBe('from-a');
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0]?.incomingSource.filePath).toBe('/b/en.json');
  });

  it('sorts by layer when packageName and filePath are equal', () => {
    // Exercise the layer sort branch
    const sources: MessageSource[] = [
      makeSource({ packageName: 'pkg', filePath: '/en.json', layer: 'library', messages: { 'a.key': 'lib' } }),
      makeSource({ packageName: 'pkg', filePath: '/en.json', layer: 'app', messages: { 'a.key': 'app' } }),
    ];
    const result = mergeMessageSources(sources);
    // 'app' < 'library' alphabetically, so app source runs first
    expect(result.messages['a.key']).toBe('app');
  });
});
