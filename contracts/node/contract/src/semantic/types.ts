import type { z } from 'zod';
import { ValidationScopeSchema } from './ValidationScopeSchema';
import { ValidationSeveritySchema } from '../shared/ValidationSeveritySchema';
import { ValidationIssueSchema } from './ValidationIssueSchema';
import { ValidationErrorResponseSchema } from './ValidationErrorResponseSchema';
import { FieldRuleTypeSchema } from '../contract/entity/field/FieldRuleTypeSchema';
import { FieldRuleDefinitionSchema } from '../contract/entity/field/FieldRuleDefinitionSchema';
import { EntityRuleDefinitionSchema } from '../contract/entity/EntityRuleDefinitionSchema';
import { CrossEntityValidatorRefSchema } from '../contract/entity/CrossEntityValidatorRefSchema';
import { FieldValidationSchema } from '../contract/entity/field/FieldValidationSchema';
import { EntityValidationSchema } from '../contract/entity/EntityValidationSchema';

export type ValidationScope = z.infer<typeof ValidationScopeSchema>;
export type ValidationSeverity = z.infer<typeof ValidationSeveritySchema>;

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponseSchema>;

export type FieldRuleType = z.infer<typeof FieldRuleTypeSchema>;
export type FieldRuleDefinition = z.infer<typeof FieldRuleDefinitionSchema>;
export type EntityRuleDefinition = z.infer<typeof EntityRuleDefinitionSchema>;
export type CrossEntityValidatorRef = z.infer<typeof CrossEntityValidatorRefSchema>;
export type FieldValidationBlock = z.infer<typeof FieldValidationSchema>;
export type EntityValidationBlock = z.infer<typeof EntityValidationSchema>;
