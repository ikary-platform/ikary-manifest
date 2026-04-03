/**
 * Compatibility re-export.
 *
 * Canonical definitions live in top-level src domain folders.
 */

export {
  CellManifestV1Schema,
  AppShellDefinitionSchema,
  CellMountDefinitionSchema,
  CapabilityDefinitionSchema,
  CapabilityInputDefinitionSchema,
  CapabilityInputTypeSchema,
  LifecycleTransitionDefinitionSchema,
  DomainEventActorTypeSchema,
  DomainEventActorSchema,
  DomainEventEntityRefSchema,
  DomainEventEnvelopeSchema,
} from '../contract/manifest';

export {
  EntityDefinitionSchema,
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
} from '../contract/entity';

export {
  PolicyScopeSchema,
  ActionPolicySchema,
  EntityPoliciesDefinitionSchema,
  FieldPoliciesDefinitionSchema,
  RoleDefinitionSchema,
} from '../contract/entity/policy';

export type { NavigationItemInput } from '../contract/manifest/navigation/NavigationItemSchema';
