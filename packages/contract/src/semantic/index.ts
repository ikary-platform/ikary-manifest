/**
 * validation/index.ts — public surface for the validation sub-domain.
 */

export type {
  ValidationScope,
  ValidationSeverity,
  ValidationIssue,
  ValidationErrorResponse,
  FieldRuleType,
  FieldRuleDefinition,
  EntityRuleDefinition,
  CrossEntityValidatorRef,
  FieldValidationBlock,
  EntityValidationBlock,
} from './types';

export {
  ValidationScopeSchema,
  ValidationSeveritySchema,
  ValidationIssueSchema,
  ValidationErrorResponseSchema,
} from './issue.zod';

export {
  FieldRuleTypeSchema,
  FieldRuleDefinitionSchema,
  EntityRuleDefinitionSchema,
  CrossEntityValidatorRefSchema,
} from './field-rules.zod';

export { combineValidation, makeValidationResult } from './helpers';

export { toStructuralValidationErrors } from './structural/structural-errors';
export { parseManifest } from './structural/parse-manifest';

export { validateNavigationRules } from './navigation-rules';
export { validatePageRules } from './page-rules';
export { validateEntityRules, validateSingleEntitySemantics } from './entity-rules';
export { validateRoleRules } from './role-rules';
export { validateManifestSemantics, validateBusinessRules } from './validate-manifest-semantics';

export { validateManifest } from './validate-manifest';

export { validatePresentationLayerSemantics } from './presentation-rules';
