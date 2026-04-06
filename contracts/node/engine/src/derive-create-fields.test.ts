import { describe, it, expect } from 'vitest';
import { deriveCreateFields } from './derive-create-fields';
import type { FieldDefinition } from '@ikary-manifest/contract';

function field(key: string, overrides: Partial<FieldDefinition> = {}): FieldDefinition {
  return { key, type: 'string', name: key, ...overrides } as FieldDefinition;
}

describe('deriveCreateFields — filtering', () => {
  it('excludes system fields', () => {
    const fields = [field('name'), field('id', { system: true })];
    const result = deriveCreateFields(fields);
    expect(result.map((f) => f.key)).toEqual(['name']);
  });

  it('excludes fields with create.visible=false', () => {
    const fields = [field('name'), field('secret', { create: { visible: false } })];
    const result = deriveCreateFields(fields);
    expect(result.map((f) => f.key)).toEqual(['name']);
  });

  it('excludes when create.visible undefined and form.visible=false', () => {
    const fields = [field('hidden', { form: { visible: false } })];
    const result = deriveCreateFields(fields);
    expect(result).toHaveLength(0);
  });

  it('includes when create.visible=true', () => {
    const fields = [field('name', { create: { visible: true } })];
    const result = deriveCreateFields(fields);
    expect(result.map((f) => f.key)).toEqual(['name']);
  });

  it('includes when create.visible=undefined and form.visible=true', () => {
    const fields = [field('name', { form: { visible: true } })];
    const result = deriveCreateFields(fields);
    expect(result.map((f) => f.key)).toEqual(['name']);
  });

  it('includes when both create and form are absent', () => {
    const fields = [field('name')];
    const result = deriveCreateFields(fields);
    expect(result.map((f) => f.key)).toEqual(['name']);
  });
});

describe('deriveCreateFields — effectiveOrder', () => {
  it('uses create.order when present', () => {
    const fields = [
      field('b', { create: { order: 2 } }),
      field('a', { create: { order: 1 } }),
    ];
    const result = deriveCreateFields(fields);
    expect(result.map((f) => f.key)).toEqual(['a', 'b']);
  });

  it('falls back to array index when create.order absent', () => {
    const fields = [field('first'), field('second')];
    const result = deriveCreateFields(fields);
    expect(result.map((f) => f.key)).toEqual(['first', 'second']);
  });
});

describe('deriveCreateFields — effectivePlaceholder', () => {
  it('uses create.placeholder when present', () => {
    const f = field('name', { create: { placeholder: 'create-ph' }, form: { placeholder: 'form-ph' } });
    const [r] = deriveCreateFields([f]);
    expect(r.effectivePlaceholder).toBe('create-ph');
  });

  it('falls back to form.placeholder', () => {
    const f = field('name', { form: { placeholder: 'form-ph' } });
    const [r] = deriveCreateFields([f]);
    expect(r.effectivePlaceholder).toBe('form-ph');
  });

  it('is undefined when neither placeholder is set', () => {
    const [r] = deriveCreateFields([field('name')]);
    expect(r.effectivePlaceholder).toBeUndefined();
  });
});

describe('deriveCreateFields — object fields', () => {
  it('sets effectiveFieldRules to [] for object type', () => {
    const objectField = field('metadata', { type: 'object', fields: [field('child')] });
    const [r] = deriveCreateFields([objectField]);
    expect(r.effectiveFieldRules).toEqual([]);
  });

  it('attaches children for object type', () => {
    const objectField = field('metadata', {
      type: 'object',
      fields: [field('childA'), field('childB')],
    });
    const [r] = deriveCreateFields([objectField]);
    expect((r as never as { children: unknown[] }).children).toHaveLength(2);
  });

  it('handles object type with no fields defined (fields ?? [] branch)', () => {
    const objectField = field('metadata', { type: 'object' });
    const [r] = deriveCreateFields([objectField]);
    expect((r as never as { children: unknown[] }).children).toHaveLength(0);
  });

  it('sets effectiveFieldRules from validation for non-object fields', () => {
    const rule = { type: 'required', ruleId: 'r1' };
    const f = field('name', { validation: { fieldRules: [rule as never] } });
    const [r] = deriveCreateFields([f]);
    expect(r.effectiveFieldRules).toEqual([rule]);
  });

  it('defaults effectiveFieldRules to [] when validation absent', () => {
    const [r] = deriveCreateFields([field('name')]);
    expect(r.effectiveFieldRules).toEqual([]);
  });
});

describe('deriveCreateFields — effectiveReadonly', () => {
  it('defaults to false when readonly not set', () => {
    const [r] = deriveCreateFields([field('name')]);
    expect(r.effectiveReadonly).toBe(false);
  });

  it('reflects readonly=true', () => {
    const [r] = deriveCreateFields([field('name', { readonly: true })]);
    expect(r.effectiveReadonly).toBe(true);
  });
});
