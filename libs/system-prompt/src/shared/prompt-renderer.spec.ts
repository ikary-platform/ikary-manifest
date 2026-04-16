import { describe, expect, it } from 'vitest';
import { createPromptRenderer } from './prompt-renderer';
import { PromptRegistryError } from './error-codes';

describe('createPromptRenderer', () => {
  it('interpolates variables with triple-stash (no HTML escaping)', () => {
    const renderer = createPromptRenderer();
    const tpl = renderer.compile('hello {{{name}}}', 'test/greet');
    expect(tpl.render({ name: '<World>' })).toBe('hello <World>');
  });

  it('renders the matching branch via the eq helper', () => {
    const renderer = createPromptRenderer();
    const tpl = renderer.compile(
      '{{#if (eq mode "create")}}CREATE{{else}}OTHER{{/if}}',
      'test/cond',
    );
    expect(tpl.render({ mode: 'create' })).toBe('CREATE');
    expect(tpl.render({ mode: 'fix' })).toBe('OTHER');
  });

  it('throws PromptRegistryError when a referenced variable is missing (strict mode)', () => {
    const renderer = createPromptRenderer();
    const tpl = renderer.compile('hi {{{missing}}}', 'test/strict');
    expect(() => tpl.render({})).toThrowError(PromptRegistryError);
  });
});
