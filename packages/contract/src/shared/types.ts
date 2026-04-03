import type { z } from 'zod';

import type { EntityDefinitionSchema } from '../contract/entity/EntityDefinitionSchema';
import type { EventDefinitionSchema } from '../contract/entity/event/EventDefinitionSchema';
import type {
  AuditEventSchema,
  EntityVersionSchema,
  FieldDiffSchema,
} from '../contract/entity/history/EntityHistorySchema';
import type { ActionPolicySchema } from '../contract/entity/policy/ActionPolicySchema';
import type { PolicyScopeSchema } from '../contract/entity/policy/PolicyScopeSchema';
import type {
  DisplayAlignSchema,
  DisplayDefinitionSchema,
  DisplayTypeSchema,
} from '../contract/entity/display/DisplayDefinitionSchema';
import type { ComputedFieldDefinitionSchema } from '../contract/entity/field/ComputedFieldDefinitionSchema';
import type { FieldDefinitionSchema } from '../contract/entity/field/FieldDefinitionSchema';
import type { LifecycleDefinitionSchema } from '../contract/entity/lifecycle/LifecycleDefinitionSchema';
import type { EntityPoliciesDefinitionSchema } from '../contract/entity/policy/EntityPoliciesDefinitionSchema';
import type { FieldPoliciesDefinitionSchema } from '../contract/entity/policy/FieldPoliciesDefinitionSchema';
import type { RelationDefinitionSchema } from '../contract/entity/relation/RelationDefinitionSchema';
import type { CellManifestV1Schema } from '../contract/manifest/CellManifestV1Schema';
import type { CellMetadataSchema } from '../contract/manifest/CellMetadataSchema';
import type { CellSpecSchema } from '../contract/manifest/CellSpecSchema';
import type { NavigationDefinitionSchema } from '../contract/manifest/navigation/NavigationDefinitionSchema';
import type { NavigationItemSchema } from '../contract/manifest/navigation/NavigationItemSchema';
import type { PageDefinitionSchema } from '../contract/manifest/page/PageDefinitionSchema';
import type { PageTypeSchema } from '../contract/manifest/page/PageTypeSchema';
import type { AppShellDefinitionSchema } from '../contract/manifest/shell/AppShellDefinitionSchema';
import type { CellMountDefinitionSchema } from '../contract/manifest/shell/CellMountDefinitionSchema';
import type { RoleDefinitionSchema } from '../contract/manifest/role/RoleDefinitionSchema';
import type { CapabilityDefinitionSchema } from '../contract/manifest/capability/CapabilityDefinitionSchema';
import type { CapabilityInputDefinitionSchema } from '../contract/manifest/capability/CapabilityInputDefinitionSchema';
import type { CapabilityInputTypeSchema } from '../contract/manifest/capability/CapabilityInputTypeSchema';
import type { DomainEventActorSchema } from '../contract/manifest/domain-event/DomainEventActorSchema';
import type { DomainEventActorTypeSchema } from '../contract/manifest/domain-event/DomainEventActorTypeSchema';
import type { DomainEventEntityRefSchema } from '../contract/manifest/domain-event/DomainEventEntityRefSchema';
import type { DomainEventEnvelopeSchema } from '../contract/manifest/domain-event/DomainEventEnvelopeSchema';
import type { LifecycleTransitionDefinitionSchema } from '../contract/manifest/lifecycle/LifecycleTransitionDefinitionSchema';
import type { DataContextSchema } from '../contract/data/DataContextSchema';
import type { DataProviderSchema } from '../contract/data/DataProviderSchema';

// ── Field ─────────────────────────────────────────────────────────────────────
export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;
export type FieldType = FieldDefinition['type'];
export type FieldOperationMeta = NonNullable<FieldDefinition['create']>;
export type DisplayType = z.infer<typeof DisplayTypeSchema>;
export type DisplayAlign = z.infer<typeof DisplayAlignSchema>;
export type DisplayDefinition = z.infer<typeof DisplayDefinitionSchema>;

// ── Relation ──────────────────────────────────────────────────────────────────
export type RelationDefinition = z.infer<typeof RelationDefinitionSchema>;
export type RelationType = RelationDefinition['relation'];

export type BelongsToRelation = Extract<RelationDefinition, { relation: 'belongs_to' }>;
export type HasManyRelation = Extract<RelationDefinition, { relation: 'has_many' }>;
export type ManyToManyRelation = Extract<RelationDefinition, { relation: 'many_to_many' }>;
export type SelfRelation = Extract<RelationDefinition, { relation: 'self' }>;
export type PolymorphicRelation = Extract<RelationDefinition, { relation: 'polymorphic' }>;

/** Union of all valid values for BelongsToRelation.createPolicy. */
export type RelationCreatePolicy = 'create' | 'attach' | 'create-or-attach';

// ── Computed fields ───────────────────────────────────────────────────────────
export type ComputedFieldDefinition = z.infer<typeof ComputedFieldDefinitionSchema>;
export type ComputedFieldType = ComputedFieldDefinition['type'];
export type FormulaType = ComputedFieldDefinition['formulaType'];

export type ExpressionComputedField = Extract<ComputedFieldDefinition, { formulaType: 'expression' }>;
export type ConditionalComputedField = Extract<ComputedFieldDefinition, { formulaType: 'conditional' }>;
export type AggregationComputedField = Extract<ComputedFieldDefinition, { formulaType: 'aggregation' }>;
export type AggregationOperation = AggregationComputedField['operation'];

// ── Lifecycle ─────────────────────────────────────────────────────────────────
export type LifecycleTransitionDefinition = z.infer<typeof LifecycleTransitionDefinitionSchema>;
export type LifecycleDefinition = z.infer<typeof LifecycleDefinitionSchema>;

// ── Domain Events ─────────────────────────────────────────────────────────────
export type DomainEventActorType = z.infer<typeof DomainEventActorTypeSchema>;
export type DomainEventActor = z.infer<typeof DomainEventActorSchema>;
export type DomainEventEntityRef = z.infer<typeof DomainEventEntityRefSchema>;
export type DomainEventEnvelope = z.infer<typeof DomainEventEnvelopeSchema>;

// ── Events ────────────────────────────────────────────────────────────────────
export type EventDefinition = z.infer<typeof EventDefinitionSchema>;
export type FieldDiff = z.infer<typeof FieldDiffSchema>;
export type EntityVersion = z.infer<typeof EntityVersionSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// ── Capabilities ──────────────────────────────────────────────────────────────
export type CapabilityInputType = z.infer<typeof CapabilityInputTypeSchema>;
export type CapabilityInputDefinition = z.infer<typeof CapabilityInputDefinitionSchema>;
export type CapabilityDefinition = z.infer<typeof CapabilityDefinitionSchema>;

export type CapabilityType = CapabilityDefinition['type'];
export type TransitionCapability = Extract<CapabilityDefinition, { type: 'transition' }>;
export type MutationCapability = Extract<CapabilityDefinition, { type: 'mutation' }>;
export type WorkflowCapability = Extract<CapabilityDefinition, { type: 'workflow' }>;
export type ExportCapability = Extract<CapabilityDefinition, { type: 'export' }>;
export type IntegrationCapability = Extract<CapabilityDefinition, { type: 'integration' }>;
export type ExportFormat = ExportCapability['format'];

// ── Policies & Roles ──────────────────────────────────────────────────────────
export type PolicyScope = z.infer<typeof PolicyScopeSchema>;
export type ActionPolicy = z.infer<typeof ActionPolicySchema>;
export type EntityActionPolicy = z.infer<typeof ActionPolicySchema>;
export type EntityPoliciesDefinition = z.infer<typeof EntityPoliciesDefinitionSchema>;
export type FieldPoliciesDefinition = z.infer<typeof FieldPoliciesDefinitionSchema>;
export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;

export type FieldActionPolicy = NonNullable<NonNullable<FieldPoliciesDefinition[string]>['view']>;

// ── Entity ────────────────────────────────────────────────────────────────────
export type EntityDefinition = z.infer<typeof EntityDefinitionSchema>;

// ── Data binding ──────────────────────────────────────────────────────────────
export type DataContextDefinition = z.infer<typeof DataContextSchema>;
export type DataProviderDefinition = z.infer<typeof DataProviderSchema>;

// ── Page & Navigation ─────────────────────────────────────────────────────────
export type PageType = z.infer<typeof PageTypeSchema>;
export type PageDefinition = z.infer<typeof PageDefinitionSchema>;

export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type NavigationPageItem = Extract<NavigationItem, { type: 'page' }>;
export type NavigationGroupItem = Extract<NavigationItem, { type: 'group' }>;
export type NavigationDefinition = z.infer<typeof NavigationDefinitionSchema>;

// ── Shell & Manifest ──────────────────────────────────────────────────────────
export type AppShellDefinition = z.infer<typeof AppShellDefinitionSchema>;
export type CellMountDefinition = z.infer<typeof CellMountDefinitionSchema>;
export type ShellDefinition = AppShellDefinition;
export type CellMetadata = z.infer<typeof CellMetadataSchema>;
export type CellSpec = z.infer<typeof CellSpecSchema>;
export type CellManifestV1 = z.infer<typeof CellManifestV1Schema>;

// ── Compiler result helpers ───────────────────────────────────────────────────
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
