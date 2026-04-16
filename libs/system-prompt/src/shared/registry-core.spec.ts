import { describe, expect, it, vi } from 'vitest';
import { PromptRegistry } from './registry-core';
import { PromptRegistryError } from './error-codes';

const minimalFrontmatter = (name: string, args = '') =>
  `---\nname: ${name}\ndescription: d\nusage: u\nversion: 1.0.0\n${args}---\n`;

const file = (name: string, body: string, args = '') =>
  `${minimalFrontmatter(name, args)}${body}`;

describe('PromptRegistry', () => {
  it('loads, lists, and gets prompts from a file record', () => {
    const reg = new PromptRegistry({
      '/p/a.prompt.md': file('cell-ai/manifest-generation', 'A body'),
      '/p/b.prompt.md': file('cell-ai/manifest-task', 'B body'),
    });
    const list = reg.list();
    expect(list).toHaveLength(2);
    expect(list.map((d) => d.metadata.name).sort()).toEqual([
      'cell-ai/manifest-generation',
      'cell-ai/manifest-task',
    ]);
    expect(reg.get('cell-ai/manifest-generation').body).toBe('A body');
    expect(reg.get('cell-ai/manifest-generation').source).toBe('/p/a.prompt.md');
  });

  it('throws on duplicate prompt names', () => {
    expect(
      () =>
        new PromptRegistry({
          '/p/a.prompt.md': file('cell-ai/foo', 'A'),
          '/p/b.prompt.md': file('cell-ai/foo', 'B'),
        }),
    ).toThrowError(/Duplicate prompt name/);
  });

  it('surfaces metadata validation errors with file path', () => {
    expect(
      () =>
        new PromptRegistry({
          '/p/x.prompt.md': '---\nname: bad-no-slash\n---\nbody',
        }),
    ).toThrowError(/Prompt frontmatter failed validation/);
  });

  it('renders a prompt with no arguments', () => {
    const reg = new PromptRegistry({
      '/p/a.prompt.md': file('cell-ai/manifest-generation', 'static text'),
    });
    expect(reg.render('cell-ai/manifest-generation')).toBe('static text');
  });

  it('renders with provided arguments and runs the eq helper', () => {
    const args =
      'arguments:\n  - name: task_type\n    description: variant\n    type: string\n    source: system\n';
    const body =
      '{{#if (eq task_type "create")}}CREATE{{/if}}{{#if (eq task_type "fix")}}FIX{{/if}}';
    const reg = new PromptRegistry({
      '/p/t.prompt.md': file('cell-ai/manifest-task', body, args),
    });
    expect(reg.render('cell-ai/manifest-task', { task_type: 'create' })).toBe('CREATE');
    expect(reg.render('cell-ai/manifest-task', { task_type: 'fix' })).toBe('FIX');
  });

  it('throws PROMPT_NOT_FOUND on get and render with unknown name', () => {
    const reg = new PromptRegistry({});
    expect(() => reg.get('nope')).toThrowError(PromptRegistryError);
    expect(() => reg.render('nope')).toThrowError(PromptRegistryError);
  });

  it('throws PROMPT_ARG_MISSING when a required argument is absent', () => {
    const args =
      'arguments:\n  - name: required_arg\n    description: x\n    type: string\n';
    const reg = new PromptRegistry({
      '/p/r.prompt.md': file('cell-ai/r', 'x {{{required_arg}}}', args),
    });
    expect(() => reg.render('cell-ai/r', {})).toThrowError(/Missing required argument/);
  });

  it('skips optional arguments that are absent', () => {
    const args =
      'arguments:\n  - name: opt\n    description: x\n    type: string\n    required: false\n';
    const reg = new PromptRegistry({
      '/p/o.prompt.md': file('cell-ai/o', 'static{{#if opt}} {{{opt}}}{{/if}}', args),
    });
    expect(reg.render('cell-ai/o')).toBe('static');
    expect(reg.render('cell-ai/o', { opt: 'x' })).toBe('static x');
    expect(reg.render('cell-ai/o', { opt: null })).toBe('static');
  });

  it('rejects arguments of the wrong runtime type', () => {
    const args = 'arguments:\n  - name: count\n    description: x\n    type: number\n';
    const reg = new PromptRegistry({
      '/p/n.prompt.md': file('cell-ai/n', 'count={{{count}}}', args),
    });
    expect(() => reg.render('cell-ai/n', { count: 'two' })).toThrowError(
      /expected number but received string/,
    );
    expect(() => reg.render('cell-ai/n', { count: NaN })).toThrowError(
      /expected number/,
    );
  });

  it.each([
    ['boolean', true, 'true'],
    ['boolean', 'yes', null],
    ['json', { a: 1 }, '[object Object]'],
    ['json', '{"a":1}', '{"a":1}'],
  ] as const)('handles %s argument type', (type, value, expected) => {
    const args = `arguments:\n  - name: v\n    description: x\n    type: ${type}\n    required: false\n`;
    const reg = new PromptRegistry({
      '/p/x.prompt.md': file('cell-ai/x', '{{{v}}}', args),
    });
    if (expected === null) {
      expect(() => reg.render('cell-ai/x', { v: value })).toThrowError(PromptRegistryError);
    } else {
      expect(reg.render('cell-ai/x', { v: value })).toBe(expected);
    }
  });

  it('passes user-source string args through the supplied hook', () => {
    const args =
      'arguments:\n  - name: prompt_input\n    description: x\n    type: string\n    source: user\n';
    const reg = new PromptRegistry({
      '/p/u.prompt.md': file('cell-ai/u', 'IN: {{{prompt_input}}}', args),
    });
    const hook = vi.fn((value: unknown) => `safe(${String(value)})`);
    const out = reg.render(
      'cell-ai/u',
      { prompt_input: 'raw' },
      { correlationId: 'cid', taskName: 'cell-ai/u' },
      hook,
    );
    expect(hook).toHaveBeenCalledOnce();
    expect(hook).toHaveBeenCalledWith(
      'raw',
      expect.objectContaining({ name: 'prompt_input', source: 'user' }),
      { correlationId: 'cid', taskName: 'cell-ai/u' },
    );
    expect(out).toBe('IN: safe(raw)');
  });

  it('surfaces frontmatter parse errors during construction', () => {
    expect(
      () =>
        new PromptRegistry({
          '/p/broken.prompt.md': 'no frontmatter at all',
        }),
    ).toThrowError(PromptRegistryError);
  });
});
