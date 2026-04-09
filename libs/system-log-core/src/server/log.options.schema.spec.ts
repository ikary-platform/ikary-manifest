import { describe, it, expect } from 'vitest';
import { systemLogModuleOptionsSchema } from './log.options.schema.js';

describe('systemLogModuleOptionsSchema', () => {
  it('parses valid input and applies defaults', () => {
    const r = systemLogModuleOptionsSchema.parse({ service: 'my-svc' });
    expect(r.service).toBe('my-svc');
    expect(r.pretty).toBe(false);
    expect(r.packageVersion).toBe('1.0.0');
    expect(r.seedDefaultSink).toBe(true);
  });

  it('accepts all explicit values', () => {
    const r = systemLogModuleOptionsSchema.parse({
      service: 'svc',
      pretty: true,
      packageVersion: '2.3.4',
      seedDefaultSink: false,
    });
    expect(r.pretty).toBe(true);
    expect(r.packageVersion).toBe('2.3.4');
    expect(r.seedDefaultSink).toBe(false);
  });

  it('rejects empty service name', () => {
    expect(() => systemLogModuleOptionsSchema.parse({ service: '' })).toThrow();
  });

  it('rejects missing service', () => {
    expect(() => systemLogModuleOptionsSchema.parse({})).toThrow();
  });
});
