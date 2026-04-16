import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PromptRegistryService,
  PROMPT_REGISTRY_OPTIONS,
  type PromptRegistryOptions,
} from './prompt-registry.service';
import { PromptRegistryError } from '../shared/error-codes';

function makeService(options: PromptRegistryOptions) {
  const sanitizer = { sanitize: vi.fn((s: string) => s) };
  const sizeGuard = { enforce: vi.fn() };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = new PromptRegistryService(options, sanitizer as any, sizeGuard as any);
  return { service, sanitizer, sizeGuard };
}

const MIN_FRONTMATTER = (name: string, extraArgs = '') =>
  `---\nname: ${name}\ndescription: d\nusage: u\nversion: 1.0.0\n${extraArgs}---\n`;

describe('PromptRegistryService', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'prompt-svc-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('loads prompts at onModuleInit and renders them', async () => {
    mkdirSync(join(root, 'cell-ai'), { recursive: true });
    writeFileSync(
      join(root, 'cell-ai', 'manifest-generation.prompt.md'),
      `${MIN_FRONTMATTER('cell-ai/manifest-generation')}Hello`,
    );
    const { service } = makeService({ promptsDir: root });
    await service.onModuleInit();

    expect(service.list()).toHaveLength(1);
    expect(service.get('cell-ai/manifest-generation').body).toBe('Hello');
    expect(service.render('cell-ai/manifest-generation')).toBe('Hello');
  });

  it('is idempotent: second onModuleInit does not reload', async () => {
    writeFileSync(
      join(root, 'a.prompt.md'),
      `${MIN_FRONTMATTER('cell-ai/a')}Body`,
    );
    const { service } = makeService({ promptsDir: root });
    await service.onModuleInit();
    writeFileSync(
      join(root, 'b.prompt.md'),
      `${MIN_FRONTMATTER('cell-ai/b')}Body2`,
    );
    await service.onModuleInit();
    expect(service.list()).toHaveLength(1);
  });

  it('throws when list() or render() is called before onModuleInit', () => {
    const { service } = makeService({ promptsDir: root });
    expect(() => service.list()).toThrowError(PromptRegistryError);
    expect(() => service.get('x')).toThrowError(PromptRegistryError);
    expect(() => service.render('x')).toThrowError(PromptRegistryError);
  });

  it('runs the sanitization hook on user-source string args', async () => {
    writeFileSync(
      join(root, 'u.prompt.md'),
      `${MIN_FRONTMATTER(
        'cell-ai/u',
        'arguments:\n  - name: raw\n    description: x\n    type: string\n    source: user\n',
      )}IN: {{{raw}}}`,
    );
    const { service, sanitizer, sizeGuard } = makeService({ promptsDir: root });
    await service.onModuleInit();

    sanitizer.sanitize.mockImplementation((s: string) => `safe(${s})`);

    const out = service.render(
      'cell-ai/u',
      { raw: 'hello' },
      { correlationId: 'c1', taskName: 'cell-ai/u' },
    );

    expect(sizeGuard.enforce).toHaveBeenCalledWith('hello', 8000, 'c1');
    expect(sanitizer.sanitize).toHaveBeenCalledWith('hello', {
      correlationId: 'c1',
      taskName: 'cell-ai/u',
    });
    expect(out).toBe('IN: safe(hello)');
  });

  it('fails fast when any prompt has invalid frontmatter', async () => {
    writeFileSync(join(root, 'bad.prompt.md'), 'no frontmatter here');
    const { service } = makeService({ promptsDir: root });
    await expect(service.onModuleInit()).rejects.toThrowError(PromptRegistryError);
  });
});

describe('PROMPT_REGISTRY_OPTIONS', () => {
  it('is a unique symbol token', () => {
    expect(typeof PROMPT_REGISTRY_OPTIONS).toBe('symbol');
  });
});
