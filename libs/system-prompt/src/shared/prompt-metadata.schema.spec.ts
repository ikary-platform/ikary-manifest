import { describe, expect, it } from 'vitest';
import {
  promptArgumentSchema,
  promptMetadataSchema,
  DEFAULT_USER_ARG_MAX_BYTES,
} from './prompt-metadata.schema';

describe('promptArgumentSchema', () => {
  it('parses a fully specified argument', () => {
    const parsed = promptArgumentSchema.parse({
      name: 'user_role',
      description: 'Role of the caller',
      type: 'string',
      required: false,
      source: 'user',
      maxBytes: 1024,
      example: 'founder',
    });
    expect(parsed).toMatchObject({
      name: 'user_role',
      type: 'string',
      required: false,
      source: 'user',
      maxBytes: 1024,
    });
  });

  it('applies defaults when fields are omitted', () => {
    const parsed = promptArgumentSchema.parse({
      name: 'task_type',
      description: 'closed enum',
    });
    expect(parsed.type).toBe('string');
    expect(parsed.required).toBe(true);
    expect(parsed.source).toBe('system');
  });

  it('rejects argument names that are not snake_case', () => {
    expect(() => promptArgumentSchema.parse({ name: 'UserRole', description: 'x' })).toThrow();
    expect(() => promptArgumentSchema.parse({ name: '1bad', description: 'x' })).toThrow();
  });

  it.each(['string', 'number', 'boolean', 'json'] as const)(
    'accepts %s as a valid type',
    (type) => {
      expect(promptArgumentSchema.parse({ name: 'a', description: 'd', type }).type).toBe(type);
    },
  );

  it('rejects unknown types and unknown sources', () => {
    expect(() =>
      promptArgumentSchema.parse({ name: 'a', description: 'd', type: 'date' }),
    ).toThrow();
    expect(() =>
      promptArgumentSchema.parse({ name: 'a', description: 'd', source: 'admin' }),
    ).toThrow();
  });
});

describe('promptMetadataSchema', () => {
  const valid = {
    name: 'cell-ai/manifest-generation',
    description: 'desc',
    usage: 'where',
    version: '1.0.0',
  };

  it('parses a minimal valid frontmatter', () => {
    const parsed = promptMetadataSchema.parse(valid);
    expect(parsed.arguments).toEqual([]);
  });

  it('parses with a populated arguments array', () => {
    const parsed = promptMetadataSchema.parse({
      ...valid,
      arguments: [{ name: 'foo', description: 'bar' }],
    });
    expect(parsed.arguments).toHaveLength(1);
    expect(parsed.arguments[0].required).toBe(true);
  });

  it('rejects invalid name format', () => {
    expect(() => promptMetadataSchema.parse({ ...valid, name: 'no-slash' })).toThrow();
    expect(() => promptMetadataSchema.parse({ ...valid, name: 'cell-ai/Bad' })).toThrow();
  });

  it('rejects non-semver version', () => {
    expect(() => promptMetadataSchema.parse({ ...valid, version: '1.0' })).toThrow();
    expect(() => promptMetadataSchema.parse({ ...valid, version: 'v1' })).toThrow();
  });

  it('rejects empty description and usage', () => {
    expect(() => promptMetadataSchema.parse({ ...valid, description: '' })).toThrow();
    expect(() => promptMetadataSchema.parse({ ...valid, usage: '' })).toThrow();
  });

  it('exports the user-arg byte default', () => {
    expect(DEFAULT_USER_ARG_MAX_BYTES).toBe(8000);
  });
});
