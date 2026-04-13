import { z } from 'zod';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import type { FieldRuleDefinition, FieldRuleType } from '@ikary/cell-contract';

export type CreateFormValues = Record<string, unknown>;

function findRule(rules: FieldRuleDefinition[], type: FieldRuleType) {
  return rules.find((r) => r.type === type);
}

function isRequired(rules: FieldRuleDefinition[]): boolean {
  return rules.some((r) => r.type === 'required');
}

export function buildCreateZodSchema(createFields: ResolvedCreateField[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of createFields) {
    const { type, name, enumValues, effectiveFieldRules: rules } = field;
    const required = isRequired(rules);

    switch (type) {
      case 'object': {
        const childSchema = buildCreateZodSchema((field as ResolvedCreateField).children ?? []);
        shape[field.key] = childSchema.optional();
        break;
      }

      case 'boolean':
        shape[field.key] = z.boolean().optional().default(false);
        break;

      case 'number': {
        let s = z.coerce.number({ invalid_type_error: `${name} must be a number` });
        const minRule = findRule(rules, 'number_min');
        if (minRule?.params?.['minExclusive'] != null) {
          s = s.gt(minRule.params['minExclusive'] as number, minRule.defaultMessage ?? undefined);
        } else if (minRule?.params?.['min'] != null) {
          s = s.min(minRule.params['min'] as number, minRule.defaultMessage ?? undefined);
        }
        const maxRule = findRule(rules, 'number_max');
        if (maxRule?.params?.['max'] != null) {
          s = s.max(maxRule.params['max'] as number, maxRule.defaultMessage ?? undefined);
        }
        shape[field.key] = required ? s : s.optional();
        break;
      }

      case 'enum': {
        const vals = (enumValues ?? []) as [string, ...string[]];
        const requiredRule = findRule(rules, 'required');
        shape[field.key] = required
          ? z.enum(vals, { required_error: requiredRule?.defaultMessage ?? `${name} is required` })
          : z.enum(vals).optional();
        break;
      }

      // string, text, date, datetime
      default: {
        const requiredRule = findRule(rules, 'required');
        let s: z.ZodString = z.string();
        if (required) {
          s = s.min(1, requiredRule?.defaultMessage ?? `${name} is required`);
        }
        const minLenRule = findRule(rules, 'min_length');
        if (minLenRule?.params?.['min'] != null) {
          s = s.min(minLenRule.params['min'] as number, minLenRule.defaultMessage ?? undefined);
        }
        const maxLenRule = findRule(rules, 'max_length');
        if (maxLenRule?.params?.['max'] != null) {
          s = s.max(maxLenRule.params['max'] as number, maxLenRule.defaultMessage ?? undefined);
        }
        const regexRule = findRule(rules, 'regex');
        if (regexRule?.params?.['pattern']) {
          s = s.regex(new RegExp(regexRule.params['pattern'] as string), regexRule.defaultMessage ?? undefined);
        }
        const emailRule = findRule(rules, 'email');
        if (emailRule) {
          s = s.email(emailRule.defaultMessage ?? undefined);
        }
        const futureDateRule = findRule(rules, 'future_date');
        if (futureDateRule) {
          const msg = futureDateRule.defaultMessage ?? `${name} must be today or later`;
          shape[field.key] = (required ? s : s.optional()).superRefine((val, ctx) => {
            if (!val) return;
            const d = new Date(String(val));
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d < today) ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
          });
          continue;
        }
        shape[field.key] = required ? s : s.optional();
        break;
      }
    }
  }

  return z.object(shape);
}
