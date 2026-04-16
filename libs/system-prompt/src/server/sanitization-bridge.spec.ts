import { describe, expect, it, vi } from 'vitest';
import { createSanitizationHook } from './sanitization-bridge';
import type { PromptArgument } from '../shared/prompt-metadata.schema';

function fakeSanitizer(impl?: (s: string) => string) {
  return {
    sanitize: vi.fn((input: string) => (impl ? impl(input) : input)),
  };
}

function fakeSizeGuard(impl?: (input: string, limit: number) => void) {
  return {
    enforce: vi.fn((input: string, limit: number) => impl?.(input, limit)),
  };
}

function arg(over: Partial<PromptArgument>): PromptArgument {
  return {
    name: 'v',
    description: 'd',
    type: 'string',
    required: true,
    source: 'user',
    ...over,
  };
}

describe('createSanitizationHook', () => {
  it('sanitizes and size-guards user string args with declared maxBytes', () => {
    const sanitizer = fakeSanitizer((s) => `clean(${s})`);
    const sizeGuard = fakeSizeGuard();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hook = createSanitizationHook(sanitizer as any, sizeGuard as any);

    const out = hook(
      'raw',
      arg({ maxBytes: 500 }),
      { correlationId: 'cid', taskName: 'task' },
    );

    expect(sizeGuard.enforce).toHaveBeenCalledWith('raw', 500, 'cid');
    expect(sanitizer.sanitize).toHaveBeenCalledWith('raw', {
      correlationId: 'cid',
      taskName: 'task',
    });
    expect(out).toBe('clean(raw)');
  });

  it('uses the default maxBytes when the argument does not declare one', () => {
    const sanitizer = fakeSanitizer();
    const sizeGuard = fakeSizeGuard();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hook = createSanitizationHook(sanitizer as any, sizeGuard as any);

    hook('raw', arg({}), {});

    expect(sizeGuard.enforce).toHaveBeenCalledWith('raw', 8000, '');
    expect(sanitizer.sanitize).toHaveBeenCalledWith('raw', {
      correlationId: '',
      taskName: 'v',
    });
  });

  it('does not sanitize system-source arguments', () => {
    const sanitizer = fakeSanitizer();
    const sizeGuard = fakeSizeGuard();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hook = createSanitizationHook(sanitizer as any, sizeGuard as any);

    const out = hook('raw', arg({ source: 'system' }), {});
    expect(out).toBe('raw');
    expect(sanitizer.sanitize).not.toHaveBeenCalled();
    expect(sizeGuard.enforce).not.toHaveBeenCalled();
  });

  it('does not sanitize non-string user arguments', () => {
    const sanitizer = fakeSanitizer();
    const sizeGuard = fakeSizeGuard();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hook = createSanitizationHook(sanitizer as any, sizeGuard as any);

    const obj = { payload: 1 };
    const out = hook(obj, arg({ type: 'json' }), {});
    expect(out).toBe(obj);
    expect(sanitizer.sanitize).not.toHaveBeenCalled();
  });

  it('skips sanitization when the declared type is string but the value is not', () => {
    const sanitizer = fakeSanitizer();
    const sizeGuard = fakeSizeGuard();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hook = createSanitizationHook(sanitizer as any, sizeGuard as any);

    const out = hook(42, arg({}), {});
    expect(out).toBe(42);
    expect(sanitizer.sanitize).not.toHaveBeenCalled();
  });

  it('propagates exceptions from the size guard', () => {
    const sizeGuard = fakeSizeGuard(() => {
      throw new Error('too big');
    });
    const sanitizer = fakeSanitizer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hook = createSanitizationHook(sanitizer as any, sizeGuard as any);

    expect(() => hook('x'.repeat(10), arg({}), {})).toThrow('too big');
    expect(sanitizer.sanitize).not.toHaveBeenCalled();
  });
});
