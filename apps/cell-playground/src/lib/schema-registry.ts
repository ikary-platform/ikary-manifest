import type { ZodTypeAny } from 'zod';
import {
  CellManifestV1Schema,
  CellMetadataSchema,
  CellSpecSchema,
  AppShellDefinitionSchema,
  CellMountDefinitionSchema,
  PageDefinitionSchema,
  NavigationDefinitionSchema,
  NavigationItemSchema,
  EntityDefinitionSchema,
  EntityValidationSchema,
  FieldDefinitionSchema,
  RelationDefinitionSchema,
  ComputedFieldDefinitionSchema,
  LifecycleDefinitionSchema,
  LifecycleTransitionDefinitionSchema,
  EventDefinitionSchema,
  CapabilityDefinitionSchema,
  CapabilityInputDefinitionSchema,
  EntityPoliciesDefinitionSchema,
  FieldPoliciesDefinitionSchema,
  RoleDefinitionSchema,
  PolicyScopeSchema,
  ActionPolicySchema,
  DisplayDefinitionSchema,
  DataContextSchema,
  DataProviderSchema,
} from '@ikary/cell-contract';

/**
 * Maps Zod schema object references to their catalog names.
 * Used by extractContractFields to populate subSchemaName on ContractField entries,
 * enabling drill-down navigation and links to the schema viewer.
 */
export const SCHEMA_REGISTRY = new Map<ZodTypeAny, string>([
  // Manifest
  [CellManifestV1Schema, 'CellManifestV1Schema'],
  [CellMetadataSchema, 'CellMetadataSchema'],
  [CellSpecSchema, 'CellSpecSchema'],
  [AppShellDefinitionSchema, 'AppShellDefinitionSchema'],
  [CellMountDefinitionSchema, 'CellMountDefinitionSchema'],
  [PageDefinitionSchema, 'PageDefinitionSchema'],
  [NavigationDefinitionSchema, 'NavigationDefinitionSchema'],
  [NavigationItemSchema, 'NavigationItemSchema'],
  // Entity
  [EntityDefinitionSchema, 'EntityDefinitionSchema'],
  [EntityValidationSchema, 'EntityValidationSchema'],
  [FieldDefinitionSchema, 'FieldDefinitionSchema'],
  [RelationDefinitionSchema, 'RelationDefinitionSchema'],
  [ComputedFieldDefinitionSchema, 'ComputedFieldDefinitionSchema'],
  [LifecycleDefinitionSchema, 'LifecycleDefinitionSchema'],
  [LifecycleTransitionDefinitionSchema, 'LifecycleTransitionDefinitionSchema'],
  [EventDefinitionSchema, 'EventDefinitionSchema'],
  [CapabilityDefinitionSchema, 'CapabilityDefinitionSchema'],
  [CapabilityInputDefinitionSchema, 'CapabilityInputDefinitionSchema'],
  // Policy
  [EntityPoliciesDefinitionSchema, 'EntityPoliciesDefinitionSchema'],
  [FieldPoliciesDefinitionSchema, 'FieldPoliciesDefinitionSchema'],
  [RoleDefinitionSchema, 'RoleDefinitionSchema'],
  [PolicyScopeSchema, 'PolicyScopeSchema'],
  [ActionPolicySchema, 'ActionPolicySchema'],
  // Display / data
  [DisplayDefinitionSchema, 'DisplayDefinitionSchema'],
  [DataContextSchema, 'DataContextSchema'],
  [DataProviderSchema, 'DataProviderSchema'],
]);
