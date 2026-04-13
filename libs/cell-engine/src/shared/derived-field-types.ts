import type { FieldDefinition } from '@ikary/cell-contract';
import type { FieldRuleDefinition } from '@ikary/cell-contract';

export interface ResolvedCreateField extends FieldDefinition {
  effectiveOrder: number;
  effectivePlaceholder?: string;
  effectiveHelpText?: string;
  effectiveSmallTip?: string;
  effectiveReadonly: boolean;
  effectiveFieldRules: FieldRuleDefinition[];
  children?: ResolvedCreateField[];
}
