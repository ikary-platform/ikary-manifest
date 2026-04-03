import type { FieldDefinition } from '@ikary-manifest/contract';
import type { FieldRuleDefinition } from '@ikary-manifest/contract';

export interface ResolvedCreateField extends FieldDefinition {
  effectiveOrder: number;
  effectivePlaceholder?: string;
  effectiveHelpText?: string;
  effectiveSmallTip?: string;
  effectiveReadonly: boolean;
  effectiveFieldRules: FieldRuleDefinition[];
  children?: ResolvedCreateField[];
}
