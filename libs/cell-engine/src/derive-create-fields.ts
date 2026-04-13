import type { FieldDefinition } from '@ikary/cell-contract';
import type { ResolvedCreateField } from './shared/derived-field-types';

export function deriveCreateFields(fields: FieldDefinition[]): ResolvedCreateField[] {
  return fields
    .filter((field) => {
      if (field.system) return false;
      if (field.create?.visible === false) return false;
      if (field.create?.visible === undefined && field.form?.visible === false) return false;
      return true;
    })
    .map((field, i) => ({
      ...field,
      effectiveOrder: field.create?.order ?? i,
      effectivePlaceholder: field.create?.placeholder ?? field.form?.placeholder,
      effectiveHelpText: field.helpText,
      effectiveSmallTip: field.smallTip,
      effectiveReadonly: field.readonly ?? false,
      effectiveFieldRules: field.type === 'object' ? [] : (field.validation?.fieldRules ?? []),
      ...(field.type === 'object' ? { children: deriveCreateFields(field.fields ?? []) } : {}),
    }))
    .sort((a, b) => a.effectiveOrder - b.effectiveOrder);
}
