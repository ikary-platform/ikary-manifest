---
outline: deep
---

# Field Validation Rules

Validation rules constrain what values a field accepts. They are declared in the `validation.fieldRules` array on each field and are enforced by both the client form (via Zod) and the server.

## Field rule structure

Every rule shares these fields:

| Field | Type | Description |
|-------|------|-------------|
| `ruleId` | `string` | Unique identifier for this rule within the entity |
| `type` | `FieldRuleType` | The rule kind (see below) |
| `field` | `string` | The field key this rule applies to |
| `messageKey` | `string` | i18n key used to look up the error message |
| `defaultMessage` | `string?` | Fallback message when no i18n translation is found |
| `params` | `Record<string, unknown>?` | Type-specific parameters (e.g. `{ min: 3 }`) |
| `clientSafe` | `boolean` | Whether the rule is evaluated on the client |
| `blocking` | `boolean` | Whether the rule blocks form submission |
| `severity` | `'error' \| 'warning' \| 'info'` | Displayed alongside the message |

## Field rule types

### `required`

The field must be present and non-empty.

```yaml
validation:
  fieldRules:
    - ruleId: order.name.required
      type: required
      field: name
      messageKey: order.name.required
      clientSafe: true
      blocking: true
      severity: error
```

### `min_length`

The string value must have at least `params.min` characters.

```yaml
- ruleId: order.name.min_length
  type: min_length
  field: name
  messageKey: order.name.min_length
  params:
    min: 3
  defaultMessage: Name must be at least 3 characters
  clientSafe: true
  blocking: true
  severity: error
```

### `max_length`

The string value must have at most `params.max` characters.

```yaml
- ruleId: order.notes.max_length
  type: max_length
  field: notes
  messageKey: order.notes.max_length
  params:
    max: 500
  clientSafe: true
  blocking: true
  severity: error
```

### `regex`

The string value must match `params.pattern` (a regular expression string).

```yaml
- ruleId: order.ref.regex
  type: regex
  field: ref
  messageKey: order.ref.regex
  params:
    pattern: "^ORD-[0-9]+"
  defaultMessage: Reference must start with ORD-
  clientSafe: true
  blocking: true
  severity: error
```

### `email`

The string value must be a valid email address.

```yaml
- ruleId: contact.email.format
  type: email
  field: email
  messageKey: contact.email.format
  clientSafe: true
  blocking: true
  severity: error
```

### `number_min`

The numeric value must be greater than or equal to `params.min`. Use `params.minExclusive` to require a strictly greater value.

```yaml
- ruleId: order.quantity.min
  type: number_min
  field: quantity
  messageKey: order.quantity.min
  params:
    min: 1
  defaultMessage: Quantity must be at least 1
  clientSafe: true
  blocking: true
  severity: error
```

### `number_max`

The numeric value must be less than or equal to `params.max`.

```yaml
- ruleId: order.discount.max
  type: number_max
  field: discount
  messageKey: order.discount.max
  params:
    max: 100
  clientSafe: true
  blocking: true
  severity: error
```

### `date`

Reserved for date-format validation. Use `future_date` to enforce a minimum date constraint.

### `future_date`

The date value must be today or later. The comparison uses the user's local date at midnight.

```yaml
- ruleId: subscription.expires_at.future
  type: future_date
  field: expires_at
  messageKey: subscription.expires_at.future
  defaultMessage: Expiry date must be today or later
  clientSafe: true
  blocking: true
  severity: error
```

### `enum`

Reserved for enum membership validation. Enum fields are validated automatically from `enumValues` — you do not need to declare an explicit `enum` rule.

---

## Multiple rules on one field

A field can carry multiple rules. The runtime evaluates all of them and collects all failures before returning errors to the form.

```yaml
fields:
  - key: email
    type: string
    name: Email Address
    validation:
      fieldRules:
        - ruleId: customer.email.required
          type: required
          field: email
          messageKey: customer.email.required
          clientSafe: true
          blocking: true
          severity: error
        - ruleId: customer.email.format
          type: email
          field: email
          messageKey: customer.email.format
          clientSafe: true
          blocking: true
          severity: error
```

---

## Entity-level validation

Field rules constrain individual fields. `entityRules` express constraints that span multiple fields on the same record.

```yaml
validation:
  entityRules:
    - ruleId: customer.email_required_when_active
      type: entity_invariant
      paths:
        - email
        - status
      messageKey: customer.email_required_when_active
      clientSafe: true
      blocking: true
      severity: error
```

The `paths` array lists the fields involved. The runtime uses this to associate the error with the right part of the form.

---

## Server-only validators

`serverValidators` declare rules that cannot run on the client because they require database access or cross-entity state. Three types are supported:

| Type | When it runs |
|------|-------------|
| `cross_entity` | Checks consistency across multiple entity records |
| `lifecycle` | Checks whether a lifecycle transition is permitted |
| `persistence_preview` | Runs after the record is staged but before it is committed |

```yaml
validation:
  serverValidators:
    - ruleId: order.customer_active
      type: cross_entity
      messageKey: order.customer_active
      clientSafe: false
      blocking: true
      severity: error
```

Server validators are never sent to the browser. Set `clientSafe: false` on any rule that references privileged data.

---

## How rules become a Zod schema

When the renderer derives a create or edit form, it calls `buildCreateZodSchema(fields)`. That function reads each field's `effectiveFieldRules` and builds a `z.ZodObject` matching the rules declared in the manifest. The Zod schema is passed to React Hook Form via `zodResolver`, so inline form validation is driven directly by the manifest.

See `libs/cell-renderer/src/form/schema/build-create-zod-schema.ts` for the mapping from rule types to Zod chains.
