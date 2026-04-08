---
outline: deep
---

<script setup>
import { data } from './api.data.ts'
const { baseUrl } = data
</script>

# Schema Discovery

Retrieve structural contracts for manifests, entities, pages, and capabilities. Each endpoint returns the field definitions, types, semantic rules, and notes for a given schema.

## GET /api/schemas/manifest

Returns the CellManifestV1 schema: top-level fields, spec structure, and semantic rules that govern a valid manifest.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `version` | query | string | No | Schema version. Defaults to latest. |

### Request

```bash-vue
curl {{ baseUrl }}/api/schemas/manifest
```

### Response

```json
{
  "name": "CellManifestV1",
  "version": "ikary.co/v1alpha1",
  "fields": [
    { "key": "apiVersion", "type": "literal(\"ikary.co/v1alpha1\")", "required": true, "description": "API version identifier" },
    { "key": "kind", "type": "literal(\"Cell\")", "required": true, "description": "Resource kind" },
    { "key": "metadata", "type": "CellMetadata", "required": true, "description": "Cell metadata (key, name, version, description)" },
    { "key": "spec", "type": "CellSpec", "required": true, "description": "Cell specification (mount, entities, pages, navigation, roles)" }
  ],
  "semanticRules": [
    "apiVersion must be \"ikary.co/v1alpha1\"",
    "kind must be \"Cell\"",
    "metadata.key must be snake_case",
    "spec must define at least entities, pages, or navigation",
    "entity keys must be unique",
    "page keys must be unique",
    "role keys must be unique"
  ],
  "notes": [
    "Generate manifests, not code",
    "Output must conform to the canonical Cell contract",
    "Use validate_manifest to check your output"
  ],
  "spec": [
    { "key": "mount", "type": "CellMountDefinition", "required": true, "description": "App shell mount config (mountPath, landingPage)" },
    { "key": "appShell", "type": "AppShellDefinition", "required": false, "description": "Optional app shell customization" },
    { "key": "entities", "type": "EntityDefinition[]", "required": false, "description": "Entity definitions with fields, relations, lifecycle, capabilities" },
    { "key": "pages", "type": "PageDefinition[]", "required": false, "description": "Page definitions (list, detail, create, edit, dashboard, custom)" },
    { "key": "navigation", "type": "NavigationDefinition", "required": false, "description": "Sidebar navigation structure (pages and groups)" },
    { "key": "roles", "type": "RoleDefinition[]", "required": false, "description": "Role-based access with scopes" }
  ]
}
```

The `spec` array describes the contents of the `spec` field. Use the entity, page, and capability schema endpoints for nested detail.

---

## GET /api/schemas/entity

Returns the EntityDefinition schema: fields, relations, computed fields, lifecycle, capabilities, policies, and governance.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `version` | query | string | No | Schema version. Defaults to latest. |

### Request

```bash-vue
curl {{ baseUrl }}/api/schemas/entity
```

### Response

```json
{
  "name": "EntityDefinition",
  "version": "ikary.co/v1alpha1",
  "fields": [
    { "key": "key", "type": "string (snake_case)", "required": true, "description": "Unique entity identifier" },
    { "key": "name", "type": "string", "required": true, "description": "Display name (singular)" },
    { "key": "pluralName", "type": "string", "required": true, "description": "Display name (plural)" },
    { "key": "description", "type": "string", "required": false, "description": "Entity description" },
    { "key": "fields", "type": "FieldDefinition[]", "required": true, "description": "Field definitions (string, number, boolean, date, datetime, enum, text, object)" },
    { "key": "relations", "type": "RelationDefinition[]", "required": false, "description": "Relations (belongs_to, has_many, many_to_many, self, polymorphic)" },
    { "key": "computed", "type": "ComputedFieldDefinition[]", "required": false, "description": "Computed fields (expression, conditional, aggregation)" },
    { "key": "lifecycle", "type": "LifecycleDefinition", "required": false, "description": "State machine (field, initial state, transitions)" },
    { "key": "events", "type": "EventDefinition", "required": false, "description": "Domain event configuration" },
    { "key": "capabilities", "type": "CapabilityDefinition[]", "required": false, "description": "User-facing actions (transition, mutation, workflow, export, integration)" },
    { "key": "policies", "type": "EntityPoliciesDefinition", "required": false, "description": "Entity-level access policies" },
    { "key": "fieldPolicies", "type": "FieldPoliciesDefinition", "required": false, "description": "Field-level access policies" },
    { "key": "validation", "type": "EntityValidationBlock", "required": false, "description": "Field and entity validation rules" },
    { "key": "governance", "type": "GovernanceDefinition", "required": false, "description": "Governance tier, rollback config" }
  ],
  "semanticRules": [
    "Entity keys must be unique across the manifest",
    "Field keys must be unique within an entity",
    "Field keys must not shadow base entity fields (id, createdAt, updatedAt, etc.)",
    "Relation keys must not conflict with field keys",
    "belongs_to relations require a target entity key"
  ]
}
```

The `semanticRules` array lists constraints enforced during validation beyond structural schema checks.

---

## GET /api/schemas/page

Returns the PageDefinition schema. Accepts an optional `type` filter to return only the contract for a specific page type.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `type` | query | string | No | Filter by page type: `entity-list`, `entity-detail`, `entity-create`, `entity-edit`, `dashboard`, `custom` |

### Request

```bash-vue
curl {{ baseUrl }}/api/schemas/page
```

Filter by page type:

```bash-vue
curl "{{ baseUrl }}/api/schemas/page?type=dashboard"
```

### Response

```json
{
  "name": "PageDefinition",
  "version": "ikary.co/v1alpha1",
  "fields": [
    { "key": "key", "type": "string", "required": true, "description": "Unique page identifier" },
    { "key": "type", "type": "PageType", "required": true, "description": "Page type (entity-list, entity-detail, entity-create, entity-edit, dashboard, custom)" },
    { "key": "title", "type": "string", "required": true, "description": "Page title" },
    { "key": "path", "type": "string", "required": true, "description": "Route path (must start with /)" },
    { "key": "entity", "type": "string", "required": false, "description": "Entity key (required for entity-* page types)" },
    { "key": "menu", "type": "{ label?, icon?, order? }", "required": false, "description": "Menu display configuration" },
    { "key": "options", "type": "Record<string, unknown>", "required": false, "description": "Arbitrary page options" },
    { "key": "dataContext", "type": "DataContextDefinition", "required": false, "description": "Data binding context" },
    { "key": "dataProviders", "type": "DataProviderDefinition[]", "required": false, "description": "Additional data providers" }
  ],
  "semanticRules": [
    "Page keys must be unique across the manifest",
    "Page paths must be unique and start with \"/\"",
    "Entity-bound pages (entity-list, entity-detail, entity-create, entity-edit) require an entity field",
    "Non-entity pages (dashboard, custom) must not have an entity field",
    "Only one page per entity per type (e.g., one entity-list for \"customer\")",
    "The landing page specified in spec.mount.landingPage must reference a defined page key"
  ],
  "pageTypes": [
    { "type": "entity-list", "entityRequired": true, "description": "Paginated list view for an entity" },
    { "type": "entity-detail", "entityRequired": true, "description": "Single record detail view with path param :id" },
    { "type": "entity-create", "entityRequired": true, "description": "Create form for an entity" },
    { "type": "entity-edit", "entityRequired": true, "description": "Edit form for an entity" },
    { "type": "dashboard", "entityRequired": false, "description": "Dashboard page with widgets" },
    { "type": "custom", "entityRequired": false, "description": "Free-form custom page" }
  ]
}
```

The `pageTypes` array lists all valid page types and whether each requires an `entity` field.

---

## GET /api/schemas/capability

Returns the CapabilityDefinition schema. Accepts an optional `type` filter.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `type` | query | string | No | Filter by capability type: `transition`, `mutation`, `workflow`, `export`, `integration` |

### Request

```bash-vue
curl {{ baseUrl }}/api/schemas/capability
```

### Response

```json
{
  "name": "CapabilityDefinition",
  "version": "ikary.co/v1alpha1",
  "fields": [
    { "key": "key", "type": "string (snake_case)", "required": true, "description": "Unique capability identifier" },
    { "key": "type", "type": "CapabilityType", "required": true, "description": "Capability type (transition, mutation, workflow, export, integration)" },
    { "key": "name", "type": "string", "required": false, "description": "Display name" },
    { "key": "description", "type": "string", "required": false, "description": "Capability description" },
    { "key": "scope", "type": "string", "required": false, "description": "Permission scope (defaults to entity.key.capability.key)" },
    { "key": "input", "type": "CapabilityInputDefinition[]", "required": false, "description": "Input fields for the capability" },
    { "key": "transition", "type": "string", "required": false, "description": "Lifecycle transition key (required for type=transition)" },
    { "key": "format", "type": "string", "required": false, "description": "Export format (required for type=export)" },
    { "key": "target", "type": "string", "required": false, "description": "Integration target (required for type=integration)" }
  ],
  "semanticRules": [
    "Capability keys must be unique within an entity",
    "Transition capabilities must reference a valid lifecycle transition key",
    "Input keys must be unique within a capability",
    "Select-type inputs must have non-empty options",
    "Entity-type inputs must specify the target entity key"
  ],
  "capabilityTypes": [
    { "type": "transition", "description": "Triggers a lifecycle state transition", "requiredFields": ["key", "type", "transition"] },
    { "type": "mutation", "description": "Performs a data mutation on the entity", "requiredFields": ["key", "type"] },
    { "type": "workflow", "description": "Triggers an async workflow", "requiredFields": ["key", "type"] },
    { "type": "export", "description": "Exports entity data in a given format", "requiredFields": ["key", "type", "format"] },
    { "type": "integration", "description": "Calls an external integration", "requiredFields": ["key", "type", "target"] }
  ]
}
```

The `capabilityTypes` array lists all valid types with their required fields.
