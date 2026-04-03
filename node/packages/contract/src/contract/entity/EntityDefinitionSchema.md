# Entity Definition Contract

**Version:** 1.0  
**Scope:** ikary-entity  
**Status:** Mandatory

---

This document defines the canonical **Entity Definition** contract for IKARY.

Entity Definition is the root schema used to describe one business entity inside a Cell manifest.

Think:

```
Cell -> Entity Definitions -> Entity
```

An Entity Definition is the canonical source of truth for:

- entity identity
- field structure
- relations
- computed fields
- lifecycle
- event configuration
- capabilities
- policies
- entity-level validation

Entity Definition does not define:

- page layout
- shell layout
- field renderer implementation
- list query state
- workflow runtime execution
- storage engine behavior

Those belong to other contracts.

---

## 1. Philosophy

Entity Definition is the canonical declaration of a business object in IKARY.

It must be:

- Declarative
- Typed
- Composable
- Stable
- Enterprise-oriented
- Non-creative

Entity Definition exists to answer these questions:

- What is this entity?
- What fields does it contain?
- How does it relate to other entities?
- What derived values does it expose?
- What lifecycle does it follow?
- What actions and policies apply to it?
- What entity-level validation rules exist?

Entity Definition is the root of the entity model.

---

## 2. Responsibility Boundary

### 2.1 Entity Definition owns

Entity Definition is responsible for:

- entity key
- entity display name
- entity plural display name
- field declarations
- relation declarations
- computed field declarations
- lifecycle declaration
- event declaration
- capability declaration
- entity policies
- field-level policy overrides
- entity-level validation

### 2.2 Entity Definition does not own

Entity Definition must not own:

- page composition
- page state
- shell layout
- field renderer implementation
- filter bar behavior
- pagination behavior
- runtime query execution
- workflow engine execution
- storage implementation details

Those belong to page contracts, shell contracts, display definition, field renderers, runtime, or the workflow system.

---

## 3. Canonical Position in the Architecture

Canonical layering:

```
Manifest
  └── Cell
       └── Entity Definition
            ├── Fields
            ├── Relations
            ├── Computed Fields
            ├── Lifecycle
            ├── Events
            ├── Capabilities
            ├── Policies
            └── Validation
```

This means:

- the manifest contains the cell
- the cell contains entities
- the entity definition describes one business object

---

## 4. Canonical Schema Shape

```typescript
export const EntityDefinitionSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  pluralName: z.string().min(1),
  fields: z.array(FieldDefinitionSchema),
  relations: z.array(RelationDefinitionSchema).optional(),
  computed: z.array(ComputedFieldDefinitionSchema).optional(),
  lifecycle: LifecycleDefinitionSchema.optional(),
  events: EventDefinitionSchema.optional(),
  capabilities: z.array(CapabilityDefinitionSchema).optional(),
  policies: EntityPoliciesDefinitionSchema.optional(),
  fieldPolicies: FieldPoliciesDefinitionSchema.optional(),
  validation: EntityValidationSchema.optional(),
});
```

This is the canonical V1 structure.

---

## 5. Core Identity

### 5.1 key

`key` is mandatory.

It is the stable machine-readable identifier of the entity.

Rules:

- must be unique within the cell
- must be stable over time
- should be concise
- should not depend on UI wording

Examples: `customer`, `invoice`, `subscription`.

### 5.2 name

`name` is mandatory.

It is the singular human-readable name of the entity.

Examples: `Customer`, `Invoice`, `Subscription`.

### 5.3 pluralName

`pluralName` is mandatory.

It is the plural human-readable name of the entity.

Examples: `Customers`, `Invoices`, `Subscriptions`.

---

## 6. Fields

`fields` is mandatory.

It contains the field declarations of the entity. Each entry must conform to `FieldDefinitionSchema`.

Fields define: data structure, validation intent, display intent, list/form behavior, and nested object structure.

Field Definition is the primary building block of the entity.

---

## 7. Relations

`relations` is optional.

Relations describe links between this entity and other entities. Each entry must conform to `RelationDefinitionSchema`.

Use relations for: belongs-to associations, has-many associations, many-to-many associations, self relations, and polymorphic relations when supported.

Relations describe entity relationships, not page navigation.

---

## 8. Computed Fields

`computed` is optional.

Computed fields describe derived values that are attached to the entity. Each entry must conform to `ComputedFieldDefinitionSchema`.

Use computed fields for: expressions, conditionals, and aggregations.

Computed fields are read-oriented derived values. They are not normal persisted user-input fields.

---

## 9. Lifecycle

`lifecycle` is optional.

Lifecycle describes the state-machine behavior of the entity. It must conform to `LifecycleDefinitionSchema`.

Use lifecycle when the entity has controlled state transitions such as: `draft -> active`, `pending -> approved`, `active -> archived`.

Lifecycle is entity behavior, not page behavior.

---

## 10. Events

`events` is optional.

Events describe event naming and payload exclusion rules for standard entity events. It must conform to `EventDefinitionSchema`.

Use events for: `created`, `updated`, `deleted`.

This block configures entity event behavior. It is not the full runtime event envelope system.

---

## 11. Capabilities

`capabilities` is optional.

Capabilities describe entity-level actions or system abilities associated with the entity. Each entry must conform to `CapabilityDefinitionSchema`.

Examples: `transition`, `mutation`, `workflow`, `export`, `integration`.

Capabilities are declarative descriptions of what the entity can do.

---

## 12. Policies

`policies` is optional.

Entity policies define action-level access requirements for the entity. It must conform to `EntityPoliciesDefinitionSchema`.

Typical governed actions: `view`, `create`, `update`, `delete`.

Policies define access intent. They do not execute authorization by themselves.

---

## 13. Field Policies

`fieldPolicies` is optional.

Field policies define per-field access overrides. It must conform to `FieldPoliciesDefinitionSchema`.

Typical field-level controlled actions: `view`, `update`.

This allows specific fields to have stricter or different rules than the entity default.

---

## 14. Validation

`validation` is optional.

Entity validation defines entity-scoped and server-scoped validation declarations. It must conform to `EntityValidationSchema`.

Use it for: entity invariants, cross-field rules, server validators, async validators, and persistence preview validators.

Entity validation belongs at the entity level, not inside one individual field.

---

## 15. Relationship to Child Contracts

Entity Definition is the parent contract of the entity model.

It composes the following child contracts:

- `FieldDefinitionSchema`
- `RelationDefinitionSchema`
- `ComputedFieldDefinitionSchema`
- `LifecycleDefinitionSchema`
- `EventDefinitionSchema`
- `CapabilityDefinitionSchema`
- `EntityPoliciesDefinitionSchema`
- `FieldPoliciesDefinitionSchema`
- `EntityValidationSchema`

Each child contract owns its own detailed rules.

---

## 16. Recommended Invariants

Beyond structural validation, the platform should enforce the following semantic invariants where practical:

- field keys must be unique
- relation keys should be unique
- computed field keys should be unique
- no key collisions between fields, relations, and computed fields when those names share the same runtime namespace
- lifecycle field should reference a real field
- `fieldPolicies` keys should reference real field keys
- event exclusions should reference real field keys

These checks may be implemented as schema refinements or higher-level validation passes.

---

## 17. Minimal Example

```json
{
  "key": "customer",
  "name": "Customer",
  "pluralName": "Customers",
  "fields": [
    {
      "key": "name",
      "type": "string",
      "name": "Name",
      "validation": {
        "fieldRules": [
          {
            "ruleId": "customer_name_required",
            "type": "required",
            "field": "name",
            "messageKey": "validation.customer.name.required",
            "clientSafe": true,
            "blocking": true,
            "severity": "error"
          }
        ]
      }
    },
    {
      "key": "status",
      "type": "enum",
      "name": "Status",
      "enumValues": ["draft", "active", "archived"]
    }
  ]
}
```

---

## 18. Rich Example

```json
{
  "key": "invoice",
  "name": "Invoice",
  "pluralName": "Invoices",

  "fields": [
    { "key": "number", "type": "string", "name": "Number", "readonly": true },
    { "key": "status", "type": "enum", "name": "Status", "enumValues": ["draft", "sent", "paid", "cancelled"] },
    { "key": "amount", "type": "number", "name": "Amount" }
  ],

  "relations": [{ "key": "customer", "relation": "belongs_to", "entity": "customer", "required": true }],

  "computed": [
    {
      "key": "isPaid",
      "name": "Is Paid",
      "type": "boolean",
      "formulaType": "conditional",
      "condition": "status == 'paid'",
      "then": "true",
      "else": "false"
    }
  ],

  "lifecycle": {
    "field": "status",
    "initial": "draft",
    "states": ["draft", "sent", "paid", "cancelled"],
    "transitions": [
      { "key": "send", "from": "draft", "to": "sent" },
      { "key": "mark_paid", "from": "sent", "to": "paid" }
    ]
  },

  "events": {
    "exclude": ["internalNotes"],
    "names": {
      "created": "invoice.created",
      "updated": "invoice.updated",
      "deleted": "invoice.deleted"
    }
  },

  "capabilities": [{ "key": "export_pdf", "type": "export", "format": "pdf", "scope": "entity" }],

  "policies": {
    "view": { "scope": "workspace" },
    "create": { "scope": "role", "condition": "finance:create" },
    "update": { "scope": "role", "condition": "finance:update" },
    "delete": { "scope": "role", "condition": "finance:delete" }
  },

  "fieldPolicies": {
    "amount": {
      "view": { "scope": "workspace" },
      "update": { "scope": "role", "condition": "finance:update_amount" }
    }
  },

  "validation": {
    "entityRules": [
      {
        "ruleId": "invoice_amount_positive",
        "type": "entity_invariant",
        "paths": ["amount"],
        "messageKey": "validation.invoice.amount.positive",
        "clientSafe": true,
        "blocking": true,
        "severity": "error"
      }
    ]
  }
}
```

---

## 19. Validation Guidance

An Entity Definition should be validated in two layers.

### 19.1 Structural validation

Performed by Zod:

- required fields exist
- child blocks conform to their schemas
- types are correct

### 19.2 Semantic validation

Performed by refinements or higher-level validation:

- uniqueness of keys
- valid references between blocks
- lifecycle correctness
- field policy references
- event exclusion references

Both layers are important.

---

## 20. Forbidden Patterns

The following are forbidden:

- embedding page layout inside entity definitions
- embedding field renderer implementation directly in entity definitions
- mixing entity behavior and shell behavior
- putting entity-wide validation rules on individual field schemas
- using entity definition as a dumping ground for page-specific configuration
- duplicating the same business meaning in multiple child blocks without clear source of truth

---

## 21. Recommended Defaults

Unless explicitly configured otherwise:

- `relations` absent means no relations
- `computed` absent means no computed fields
- `lifecycle` absent means no lifecycle
- `events` absent means default entity event behavior
- `capabilities` absent means no extra entity capabilities
- `policies` absent means platform default authorization behavior applies
- `fieldPolicies` absent means field access inherits from entity policy defaults
- `validation` absent means no entity-level validation rules are declared

---

## 22. Definition of Done

An Entity Definition is compliant if:

- it has valid identity properties
- it declares valid field definitions
- optional child blocks are correctly scoped
- entity-level validation is separate from field-level validation
- policies are explicit when needed
- capabilities are declarative
- no forbidden patterns are used

---

## 23. Canonical Summary

Entity Definition is the canonical root contract for one business entity in IKARY.

**It owns:**

- entity identity
- field composition
- relation declarations
- computed fields
- lifecycle
- events
- capabilities
- policies
- entity-level validation

**It does not own:**

- page behavior
- shell behavior
- field renderer implementation
- query state
- runtime execution

Canonical layering:

```
Entity Definition
  ├── Fields
  ├── Relations
  ├── Computed Fields
  ├── Lifecycle
  ├── Events
  ├── Capabilities
  ├── Policies
  └── Validation
```
