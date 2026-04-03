/**
 * @ikary-manifest/contract — public entry point
 *
 * Re-exports every public symbol in two logical groups:
 *
 *  1. Manifest — the structural definition of a Cell (entities, pages,
 *     navigation, shell). Types live in shared/types.ts;
 *     schema definitions live in top-level src domain folders.
 *
 *  2. Validation — the rule and issue contract used at all layers of the
 *     platform (schema-time field rules, runtime issue format, business-rule
 *     helpers). Validation rules and issue schemas both live under
 *     src/semantic/.
 *
 * Consumers should import exclusively from this entry point, never from
 * internal paths.
 */

// ── Base entity fields ────────────────────────────────────────────────────────
export { BASE_ENTITY_FIELDS, BASE_ENTITY_FIELD_KEYS } from './shared/base-entity';

// ── Data binding schemas ───────────────────────────────────────────────────────
export { DataContextSchema } from './contract/data/DataContextSchema';
export { DataProviderSchema } from './contract/data/DataProviderSchema';

// ── Manifest types ────────────────────────────────────────────────────────────
export type {
  DataContextDefinition,
  DataProviderDefinition,
  FieldType,
  FieldOperationMeta,
  FieldDefinition,
  RelationType,
  RelationDefinition,
  RelationCreatePolicy,
  BelongsToRelation,
  HasManyRelation,
  ManyToManyRelation,
  SelfRelation,
  PolymorphicRelation,
  ComputedFieldType,
  FormulaType,
  AggregationOperation,
  ComputedFieldDefinition,
  ExpressionComputedField,
  ConditionalComputedField,
  AggregationComputedField,
  LifecycleTransitionDefinition,
  LifecycleDefinition,
  DomainEventActorType,
  DomainEventActor,
  DomainEventEntityRef,
  DomainEventEnvelope,
  EventDefinition,
  FieldDiff,
  EntityVersion,
  AuditEvent,
  CapabilityInputType,
  CapabilityType,
  ExportFormat,
  CapabilityInputDefinition,
  TransitionCapability,
  MutationCapability,
  WorkflowCapability,
  ExportCapability,
  IntegrationCapability,
  CapabilityDefinition,
  PolicyScope,
  ActionPolicy,
  EntityActionPolicy,
  FieldActionPolicy,
  EntityPoliciesDefinition,
  FieldPoliciesDefinition,
  RoleDefinition,
  EntityDefinition,
  PageType,
  PageDefinition,
  NavigationItem,
  NavigationPageItem,
  NavigationGroupItem,
  NavigationDefinition,
  AppShellDefinition,
  CellMountDefinition,
  ShellDefinition,
  CellMetadata,
  CellSpec,
  CellManifestV1,
  ValidationError,
  ValidationResult,
  DisplayType,
  DisplayAlign,
  DisplayDefinition,
} from './shared/types';

// ── Zod schemas ───────────────────────────────────────────────────────────────
export {
  CellManifestV1Schema,
  AppShellDefinitionSchema,
  CellMountDefinitionSchema,
  LifecycleTransitionDefinitionSchema,
  DomainEventActorTypeSchema,
  DomainEventActorSchema,
  DomainEventEntityRefSchema,
  DomainEventEnvelopeSchema,
  CapabilityInputTypeSchema,
  CapabilityInputDefinitionSchema,
  CapabilityDefinitionSchema,
} from './contract/manifest';

export {
  EntityDefinitionSchema,
  EntityValidationSchema,
  DisplayTypeSchema,
  DisplayAlignSchema,
  DisplayDefinitionSchema,
  FieldDefinitionSchema,
  RelationDefinitionSchema,
  ComputedFieldDefinitionSchema,
  LifecycleDefinitionSchema,
  EventDefinitionSchema,
  FieldDiffKindSchema,
  FieldDiffSchema,
  EntityVersionSchema,
  AuditEventTypeSchema,
  AuditEventSchema,
} from './contract/entity';

export {
  PolicyScopeSchema,
  ActionPolicySchema,
  EntityPoliciesDefinitionSchema,
  FieldPoliciesDefinitionSchema,
  RoleDefinitionSchema,
} from './contract/entity/policy';
// ── Schema catalog ────────────────────────────────────────────────────────────
export type { SchemaCategory, SchemaCatalogEntry } from './schema-catalog';
export { CELL_SCHEMA_CATALOG } from './schema-catalog';

// ── Schema module graph ──────────────────────────────────────────────────────
export type {
  SchemaModuleCategory,
  SchemaModuleNode,
  SchemaModuleEdge,
  SchemaModuleUnresolvedImport,
  SchemaModuleGraph,
} from './schema-module-graph';
export { CELL_SCHEMA_MODULE_GRAPH } from './schema-module-graph';

// ── Package meta ──────────────────────────────────────────────────────────────
export type { CellPackageMeta } from './shared/package-meta';
export { CellPackageMetaSchema } from './shared/package-meta';

// ── Validation (types, Zod schemas, helpers, business rules) ─────────────────
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
  ManifestValidationResult,
} from './semantic';

export {
  ValidationScopeSchema,
  ValidationSeveritySchema,
  ValidationIssueSchema,
  ValidationErrorResponseSchema,
  FieldRuleTypeSchema,
  FieldRuleDefinitionSchema,
  EntityRuleDefinitionSchema,
  CrossEntityValidatorRefSchema,
  validateManifest,
  validateManifestSemantics,
  validateBusinessRules,
  parseManifest,
  combineValidation,
  makeValidationResult,
  validateSingleEntitySemantics,
  validatePresentationLayerSemantics,
} from './semantic';

export { PresentationLayerSchema } from './contract/manifest/PresentationLayerSchema';
export type { PresentationLayer } from './contract/manifest/PresentationLayerSchema';

export { snakeCaseKeySchema } from './shared/identifiers';

// ── API contracts (route params, response shapes, query types, URL helpers) ───
export * from './api';
