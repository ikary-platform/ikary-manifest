import { describe, it, expect } from 'vitest';
import { buildCreateZodSchema } from './build-create-zod-schema';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import type { FieldRuleDefinition } from '@ikary/cell-contract';

// ── Helpers ───────────────────────────────────────────────────────────────────

function rule(
  type: FieldRuleDefinition['type'],
  params?: Record<string, unknown>,
  defaultMessage?: string,
): FieldRuleDefinition {
  return { type, ruleId: type, params, defaultMessage } as FieldRuleDefinition;
}

function field(
  key: string,
  type: ResolvedCreateField['type'],
  rules: FieldRuleDefinition[] = [],
  overrides: Partial<ResolvedCreateField> = {},
): ResolvedCreateField {
  return {
    key,
    type,
    name: key,
    label: key,
    effectiveOrder: 0,
    effectiveReadonly: false,
    effectiveFieldRules: rules,
    effectivePlaceholder: undefined,
    effectiveHelpText: undefined,
    effectiveSmallTip: undefined,
    ...overrides,
  } as unknown as ResolvedCreateField;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildCreateZodSchema', () => {
  describe('string fields', () => {
    it('optional string field accepts any string', () => {
      const schema = buildCreateZodSchema([field('notes', 'string')]);
      expect(schema.safeParse({ notes: 'anything' }).success).toBe(true);
      expect(schema.safeParse({}).success).toBe(true);
    });

    it('required string field rejects empty', () => {
      const schema = buildCreateZodSchema([field('name', 'string', [rule('required')])]);
      expect(schema.safeParse({ name: 'Alice' }).success).toBe(true);
      expect(schema.safeParse({ name: '' }).success).toBe(false);
    });

    it('applies min_length rule', () => {
      const schema = buildCreateZodSchema([
        field('name', 'string', [rule('required'), rule('min_length', { min: 3 })]),
      ]);
      expect(schema.safeParse({ name: 'Al' }).success).toBe(false);
      expect(schema.safeParse({ name: 'Ali' }).success).toBe(true);
    });

    it('applies max_length rule', () => {
      const schema = buildCreateZodSchema([
        field('code', 'string', [rule('required'), rule('max_length', { max: 5 })]),
      ]);
      expect(schema.safeParse({ code: 'ABCDE' }).success).toBe(true);
      expect(schema.safeParse({ code: 'ABCDEF' }).success).toBe(false);
    });

    it('applies regex rule', () => {
      const schema = buildCreateZodSchema([
        field('slug', 'string', [rule('required'), rule('regex', { pattern: '^[a-z-]+$' })]),
      ]);
      expect(schema.safeParse({ slug: 'my-slug' }).success).toBe(true);
      expect(schema.safeParse({ slug: 'MY SLUG' }).success).toBe(false);
    });

    it('applies email rule', () => {
      const schema = buildCreateZodSchema([field('email', 'string', [rule('required'), rule('email')])]);
      expect(schema.safeParse({ email: 'user@example.com' }).success).toBe(true);
      expect(schema.safeParse({ email: 'not-an-email' }).success).toBe(false);
    });
  });

  describe('boolean fields', () => {
    it('boolean field defaults to false when absent', () => {
      const schema = buildCreateZodSchema([field('active', 'boolean')]);
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
      expect((result.data as Record<string, unknown>).active).toBe(false);
    });
  });

  describe('number fields', () => {
    it('optional number field', () => {
      const schema = buildCreateZodSchema([field('score', 'number')]);
      expect(schema.safeParse({}).success).toBe(true);
    });

    it('required number field', () => {
      const schema = buildCreateZodSchema([field('score', 'number', [rule('required')])]);
      expect(schema.safeParse({ score: 42 }).success).toBe(true);
    });

    it('coerces string to number', () => {
      const schema = buildCreateZodSchema([field('age', 'number', [rule('required')])]);
      expect(schema.safeParse({ age: '25' }).success).toBe(true);
    });

    it('applies number_min (inclusive)', () => {
      const schema = buildCreateZodSchema([
        field('age', 'number', [rule('required'), rule('number_min', { min: 18 })]),
      ]);
      expect(schema.safeParse({ age: 18 }).success).toBe(true);
      expect(schema.safeParse({ age: 17 }).success).toBe(false);
    });

    it('applies number_min (exclusive)', () => {
      const schema = buildCreateZodSchema([
        field('score', 'number', [rule('required'), rule('number_min', { minExclusive: 0 })]),
      ]);
      expect(schema.safeParse({ score: 1 }).success).toBe(true);
      expect(schema.safeParse({ score: 0 }).success).toBe(false);
    });

    it('applies number_max', () => {
      const schema = buildCreateZodSchema([
        field('score', 'number', [rule('required'), rule('number_max', { max: 100 })]),
      ]);
      expect(schema.safeParse({ score: 100 }).success).toBe(true);
      expect(schema.safeParse({ score: 101 }).success).toBe(false);
    });
  });

  describe('enum fields', () => {
    it('accepts valid enum value', () => {
      const schema = buildCreateZodSchema([
        field('status', 'enum', [rule('required')], { enumValues: ['active', 'inactive'] }),
      ]);
      expect(schema.safeParse({ status: 'active' }).success).toBe(true);
    });

    it('rejects invalid enum value', () => {
      const schema = buildCreateZodSchema([
        field('status', 'enum', [rule('required')], { enumValues: ['active', 'inactive'] }),
      ]);
      expect(schema.safeParse({ status: 'invalid' }).success).toBe(false);
    });

    it('optional enum can be omitted', () => {
      const schema = buildCreateZodSchema([field('status', 'enum', [], { enumValues: ['active', 'inactive'] })]);
      expect(schema.safeParse({}).success).toBe(true);
    });
  });

  describe('object fields', () => {
    it('object field is optional and accepts nested data', () => {
      const childField = field('nested', 'string');
      const objField = field('metadata', 'object', [], { children: [childField] });
      const schema = buildCreateZodSchema([objField]);
      expect(schema.safeParse({ metadata: { nested: 'val' } }).success).toBe(true);
      expect(schema.safeParse({}).success).toBe(true);
    });

    it('object field with no children defaults to empty schema', () => {
      const objField = field('metadata', 'object', [], { children: undefined as never });
      const schema = buildCreateZodSchema([objField]);
      expect(schema.safeParse({}).success).toBe(true);
    });
  });

  describe('enum fields', () => {
    it('enum field with no enumValues defaults to empty tuple', () => {
      // enumValues undefined → ?? [] → z.enum([]) which accepts nothing
      const schema = buildCreateZodSchema([field('status', 'enum', [], { enumValues: undefined })]);
      expect(schema.safeParse({}).success).toBe(true);
    });
  });

  describe('date fields with future_date rule', () => {
    it('rejects past dates when future_date rule is applied', () => {
      const schema = buildCreateZodSchema([
        field('startDate', 'date', [rule('required'), rule('future_date', undefined, 'Must be today or later')]),
      ]);
      expect(schema.safeParse({ startDate: '2000-01-01' }).success).toBe(false);
    });

    it('accepts today or future dates when future_date rule is applied', () => {
      const today = new Date();
      const schema = buildCreateZodSchema([
        field('startDate', 'date', [rule('required'), rule('future_date', undefined, 'Must be today or later')]),
      ]);
      const futureDate = new Date(today.getTime() + 86400000 * 30); // 30 days from now
      const dateStr = futureDate.toISOString().split('T')[0];
      expect(schema.safeParse({ startDate: dateStr }).success).toBe(true);
    });

    it('uses default message when future_date rule has no defaultMessage', () => {
      const schema = buildCreateZodSchema([
        field('startDate', 'date', [rule('required'), rule('future_date')]),
      ]);
      const result = schema.safeParse({ startDate: '2000-01-01' });
      expect(result.success).toBe(false);
    });

    it('optional future_date field passes when empty', () => {
      const schema = buildCreateZodSchema([
        field('startDate', 'date', [rule('future_date')]),
      ]);
      expect(schema.safeParse({}).success).toBe(true);
    });

    it('optional future_date field rejects past date', () => {
      const schema = buildCreateZodSchema([
        field('startDate', 'date', [rule('future_date')]),
      ]);
      expect(schema.safeParse({ startDate: '2000-01-01' }).success).toBe(false);
    });
  });

  describe('empty schema', () => {
    it('returns an object schema for empty fields', () => {
      const schema = buildCreateZodSchema([]);
      expect(schema.safeParse({}).success).toBe(true);
    });
  });
});
