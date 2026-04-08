import { Injectable } from '@nestjs/common';
import { CELL_SCHEMA_CATALOG } from '@ikary/contract';
import type { SchemaCatalogEntry } from '@ikary/contract';

export interface SchemaField {
  key: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface SchemaInfo {
  name: string;
  version: string;
  fields: SchemaField[];
  semanticRules: string[];
  notes?: string[];
}

const MANIFEST_SCHEMA: SchemaInfo = {
  name: 'CellManifestV1',
  version: 'ikary.co/v1alpha1',
  fields: [
    { key: 'apiVersion', type: 'literal("ikary.co/v1alpha1")', required: true, description: 'API version identifier' },
    { key: 'kind', type: 'literal("Cell")', required: true, description: 'Resource kind' },
    { key: 'metadata', type: 'CellMetadata', required: true, description: 'Cell metadata (key, name, version, description)' },
    { key: 'spec', type: 'CellSpec', required: true, description: 'Cell specification (mount, entities, pages, navigation, roles)' },
  ],
  semanticRules: [
    'apiVersion must be "ikary.co/v1alpha1"',
    'kind must be "Cell"',
    'metadata.key must be snake_case',
    'spec must define at least entities, pages, or navigation',
    'entity keys must be unique',
    'page keys must be unique',
    'role keys must be unique',
  ],
  notes: [
    'Generate manifests, not code',
    'Output must conform to the canonical Cell contract',
    'Use validate_manifest to check your output',
  ],
};

const SPEC_FIELDS: SchemaField[] = [
  { key: 'mount', type: 'CellMountDefinition', required: true, description: 'App shell mount config (mountPath, landingPage)' },
  { key: 'appShell', type: 'AppShellDefinition', required: false, description: 'Optional app shell customization' },
  { key: 'entities', type: 'EntityDefinition[]', required: false, description: 'Entity definitions with fields, relations, lifecycle, capabilities' },
  { key: 'pages', type: 'PageDefinition[]', required: false, description: 'Page definitions (list, detail, create, edit, dashboard, custom)' },
  { key: 'navigation', type: 'NavigationDefinition', required: false, description: 'Sidebar navigation structure (pages and groups)' },
  { key: 'roles', type: 'RoleDefinition[]', required: false, description: 'Role-based access with scopes' },
];

const ENTITY_SCHEMA: SchemaInfo = {
  name: 'EntityDefinition',
  version: 'ikary.co/v1alpha1',
  fields: [
    { key: 'key', type: 'string (snake_case)', required: true, description: 'Unique entity identifier' },
    { key: 'name', type: 'string', required: true, description: 'Display name (singular)' },
    { key: 'pluralName', type: 'string', required: true, description: 'Display name (plural)' },
    { key: 'description', type: 'string', required: false, description: 'Entity description' },
    { key: 'fields', type: 'FieldDefinition[]', required: true, description: 'Field definitions (string, number, boolean, date, datetime, enum, text, object)' },
    { key: 'relations', type: 'RelationDefinition[]', required: false, description: 'Relations (belongs_to, has_many, many_to_many, self, polymorphic)' },
    { key: 'computed', type: 'ComputedFieldDefinition[]', required: false, description: 'Computed fields (expression, conditional, aggregation)' },
    { key: 'lifecycle', type: 'LifecycleDefinition', required: false, description: 'State machine (field, initial state, transitions)' },
    { key: 'events', type: 'EventDefinition', required: false, description: 'Domain event configuration' },
    { key: 'capabilities', type: 'CapabilityDefinition[]', required: false, description: 'User-facing actions (transition, mutation, workflow, export, integration)' },
    { key: 'policies', type: 'EntityPoliciesDefinition', required: false, description: 'Entity-level access policies' },
    { key: 'fieldPolicies', type: 'FieldPoliciesDefinition', required: false, description: 'Field-level access policies' },
    { key: 'validation', type: 'EntityValidationBlock', required: false, description: 'Field and entity validation rules' },
    { key: 'governance', type: 'GovernanceDefinition', required: false, description: 'Governance tier, rollback config' },
  ],
  semanticRules: [
    'Entity keys must be unique across the manifest',
    'Field keys must be unique within an entity',
    'Field keys must not shadow base entity fields (id, createdAt, updatedAt, etc.)',
    'Relation keys must not conflict with field keys',
    'belongs_to and self relation keys must end with "_id"',
    'Lifecycle field must reference a declared field',
    'Lifecycle initial state must be one of the defined states',
    'Transition from/to states must be valid lifecycle states',
    'Capability keys must be unique within an entity',
    'Transition capabilities must reference valid lifecycle transitions',
    'Nested objects have max depth of 3',
    'Enum fields must have non-empty enumValues',
  ],
};

const PAGE_TYPES = [
  { type: 'entity-list', entityRequired: true, description: 'Paginated list view for an entity' },
  { type: 'entity-detail', entityRequired: true, description: 'Single record detail view with path param :id' },
  { type: 'entity-create', entityRequired: true, description: 'Create form for an entity' },
  { type: 'entity-edit', entityRequired: true, description: 'Edit form for an entity' },
  { type: 'dashboard', entityRequired: false, description: 'Dashboard page with widgets' },
  { type: 'custom', entityRequired: false, description: 'Custom page with arbitrary layout' },
];

const PAGE_SCHEMA: SchemaInfo = {
  name: 'PageDefinition',
  version: 'ikary.co/v1alpha1',
  fields: [
    { key: 'key', type: 'string', required: true, description: 'Unique page identifier' },
    { key: 'type', type: 'PageType', required: true, description: 'Page type (entity-list, entity-detail, entity-create, entity-edit, dashboard, custom)' },
    { key: 'title', type: 'string', required: true, description: 'Page title' },
    { key: 'path', type: 'string', required: true, description: 'Route path (must start with /)' },
    { key: 'entity', type: 'string', required: false, description: 'Entity key (required for entity-* page types)' },
    { key: 'menu', type: '{ label?, icon?, order? }', required: false, description: 'Menu display configuration' },
    { key: 'options', type: 'Record<string, unknown>', required: false, description: 'Arbitrary page options' },
    { key: 'dataContext', type: 'DataContextDefinition', required: false, description: 'Data binding context' },
    { key: 'dataProviders', type: 'DataProviderDefinition[]', required: false, description: 'Additional data providers' },
  ],
  semanticRules: [
    'Page keys must be unique across the manifest',
    'Page paths must be unique and start with "/"',
    'Entity-bound pages (entity-list, entity-detail, entity-create, entity-edit) require an entity field',
    'Non-entity pages (dashboard, custom) must not have an entity field',
    'Only one page per entity per type (e.g., one entity-list for "customer")',
    'The landing page specified in spec.mount.landingPage must reference a defined page key',
  ],
};

const CAPABILITY_TYPES = [
  { type: 'transition', description: 'Triggers a lifecycle state transition', requiredFields: ['key', 'type', 'transition'] },
  { type: 'mutation', description: 'Performs a data mutation on the entity', requiredFields: ['key', 'type'] },
  { type: 'workflow', description: 'Triggers an async workflow', requiredFields: ['key', 'type'] },
  { type: 'export', description: 'Exports entity data in a given format', requiredFields: ['key', 'type', 'format'] },
  { type: 'integration', description: 'Calls an external integration', requiredFields: ['key', 'type', 'target'] },
];

const CAPABILITY_SCHEMA: SchemaInfo = {
  name: 'CapabilityDefinition',
  version: 'ikary.co/v1alpha1',
  fields: [
    { key: 'key', type: 'string (snake_case)', required: true, description: 'Unique capability identifier' },
    { key: 'type', type: 'CapabilityType', required: true, description: 'Capability type (transition, mutation, workflow, export, integration)' },
    { key: 'name', type: 'string', required: false, description: 'Display name' },
    { key: 'description', type: 'string', required: false, description: 'Capability description' },
    { key: 'scope', type: 'string', required: false, description: 'Permission scope (defaults to entity.key.capability.key)' },
    { key: 'input', type: 'CapabilityInputDefinition[]', required: false, description: 'Input fields for the capability' },
    { key: 'transition', type: 'string', required: false, description: 'Lifecycle transition key (required for type=transition)' },
    { key: 'format', type: 'string', required: false, description: 'Export format (required for type=export)' },
    { key: 'target', type: 'string', required: false, description: 'Integration target (required for type=integration)' },
  ],
  semanticRules: [
    'Capability keys must be unique within an entity',
    'Transition capabilities must reference a valid lifecycle transition key',
    'Input keys must be unique within a capability',
    'Select-type inputs must have non-empty options',
    'Entity-type inputs must specify the target entity key',
  ],
};

@Injectable()
export class DiscoveryService {
  getManifestSchema(_version?: string) {
    return {
      ...MANIFEST_SCHEMA,
      spec: SPEC_FIELDS,
    };
  }

  getEntitySchema(_version?: string) {
    return ENTITY_SCHEMA;
  }

  getPageSchema(pageType?: string) {
    if (pageType) {
      const pt = PAGE_TYPES.find((t) => t.type === pageType);
      if (!pt) return { error: `Unknown page type: ${pageType}. Valid types: ${PAGE_TYPES.map((t) => t.type).join(', ')}` };
      return {
        ...PAGE_SCHEMA,
        pageType: pt,
      };
    }
    return {
      ...PAGE_SCHEMA,
      pageTypes: PAGE_TYPES,
    };
  }

  getCapabilitySchema(capabilityType?: string) {
    if (capabilityType) {
      const ct = CAPABILITY_TYPES.find((t) => t.type === capabilityType);
      if (!ct) return { error: `Unknown capability type: ${capabilityType}. Valid types: ${CAPABILITY_TYPES.map((t) => t.type).join(', ')}` };
      return {
        ...CAPABILITY_SCHEMA,
        capabilityType: ct,
      };
    }
    return {
      ...CAPABILITY_SCHEMA,
      capabilityTypes: CAPABILITY_TYPES,
    };
  }

  getSchemaCatalog() {
    return CELL_SCHEMA_CATALOG.map((entry: SchemaCatalogEntry) => ({
      name: entry.name,
      category: entry.category,
      summary: entry.summary,
      purpose: entry.purpose,
    }));
  }
}
