import { describe, it, expect } from 'vitest';
import { deriveEditFields } from './derive-edit-fields';
import type { FieldDefinition } from '@ikary-manifest/contract';

function field(key: string, overrides: Partial<FieldDefinition> = {}): FieldDefinition {
  return { key, type: 'string', label: key, ...overrides } as FieldDefinition;
}

describe('deriveEditFields', () => {
  describe('system field exclusion', () => {
    it('excludes system fields', () => {
      const fields = [field('name'), field('id', { system: true }), field('tenant_id', { system: true })];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['name']);
    });
  });

  describe('edit.visible', () => {
    it('excludes fields with edit.visible=false', () => {
      const fields = [field('name'), field('secret', { edit: { visible: false } })];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['name']);
    });

    it('includes fields with edit.visible=true', () => {
      const fields = [field('name', { edit: { visible: true } })];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['name']);
    });
  });

  describe('fallback to create.visible', () => {
    it('excludes when edit.visible undefined and create.visible=false', () => {
      const fields = [field('hidden', { create: { visible: false } })];
      const result = deriveEditFields(fields);
      expect(result).toHaveLength(0);
    });

    it('includes when edit.visible undefined and create.visible=true', () => {
      const fields = [field('name', { create: { visible: true } })];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['name']);
    });
  });

  describe('fallback to form.visible', () => {
    it('excludes when both edit and create undefined and form.visible=false', () => {
      const fields = [field('hidden', { form: { visible: false } })];
      const result = deriveEditFields(fields);
      expect(result).toHaveLength(0);
    });

    it('includes when both edit and create undefined and form.visible=true', () => {
      const fields = [field('name', { form: { visible: true } })];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['name']);
    });
  });

  describe('effectiveOrder', () => {
    it('uses edit.order first', () => {
      const fields = [field('b', { edit: { order: 2 }, create: { order: 99 } }), field('a', { edit: { order: 1 } })];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['a', 'b']);
    });

    it('falls back to create.order when edit.order absent', () => {
      const fields = [field('b', { create: { order: 2 } }), field('a', { create: { order: 1 } })];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['a', 'b']);
    });

    it('falls back to array index when no order specified', () => {
      const fields = [field('first'), field('second')];
      const result = deriveEditFields(fields);
      expect(result.map((f) => f.key)).toEqual(['first', 'second']);
    });
  });

  describe('effectivePlaceholder', () => {
    it('uses edit.placeholder first', () => {
      const f = field('name', {
        edit: { placeholder: 'edit-ph' },
        create: { placeholder: 'create-ph' },
      });
      const [r] = deriveEditFields([f]);
      expect(r.effectivePlaceholder).toBe('edit-ph');
    });

    it('falls back to create.placeholder', () => {
      const f = field('name', { create: { placeholder: 'create-ph' }, form: { placeholder: 'form-ph' } });
      const [r] = deriveEditFields([f]);
      expect(r.effectivePlaceholder).toBe('create-ph');
    });

    it('falls back to form.placeholder', () => {
      const f = field('name', { form: { placeholder: 'form-ph' } });
      const [r] = deriveEditFields([f]);
      expect(r.effectivePlaceholder).toBe('form-ph');
    });
  });

  describe('object fields', () => {
    it('includes object fields and gives them an empty effectiveFieldRules', () => {
      const objectField = field('metadata', {
        type: 'object',
        fields: [field('nested')],
      });
      const result = deriveEditFields([objectField]);
      expect(result).toHaveLength(1);
      expect(result[0].effectiveFieldRules).toEqual([]);
    });

    it('recursively includes children for object type', () => {
      const objectField = field('metadata', {
        type: 'object',
        fields: [field('childA'), field('childB')],
      });
      const [r] = deriveEditFields([objectField]);
      expect((r as never as { children: unknown[] }).children).toHaveLength(2);
    });

    it('handles object type with no fields defined (fields ?? [] branch)', () => {
      const objectField = field('metadata', { type: 'object' });
      const [r] = deriveEditFields([objectField]);
      expect((r as never as { children: unknown[] }).children).toHaveLength(0);
    });
  });

  describe('effectiveReadonly', () => {
    it('defaults to false when readonly is not set', () => {
      const [r] = deriveEditFields([field('name')]);
      expect(r.effectiveReadonly).toBe(false);
    });

    it('reflects readonly=true', () => {
      const [r] = deriveEditFields([field('name', { readonly: true })]);
      expect(r.effectiveReadonly).toBe(true);
    });
  });

  describe('effectiveFieldRules', () => {
    it('includes fieldRules from validation for non-object fields', () => {
      const rule = { type: 'required', ruleId: 'r1' };
      const f = field('name', { validation: { fieldRules: [rule as never] } });
      const [r] = deriveEditFields([f]);
      expect(r.effectiveFieldRules).toEqual([rule]);
    });
  });
});
