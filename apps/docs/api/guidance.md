---
outline: deep
---

<script setup>
import { data } from './api.data.ts'
const { baseUrl } = data
</script>

# Guidance

Get structural recommendations for building manifests. These endpoints analyze input and return suggested entities, pages, relations, and error explanations.

## POST /api/guidance/recommend

Takes a business goal and returns a recommended manifest structure: entities, pages, relations, and navigation.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `goal` | string | Yes | A business goal in plain language |

### Request

```bash-vue
curl -X POST {{ baseUrl }}/api/guidance/recommend \
  -H "Content-Type: application/json" \
  -d '{ "goal": "a simple CRM to manage customers and deals" }'
```

### Response

```json
{
  "matchedDomain": "crm",
  "suggestedEntities": [
    {
      "key": "account",
      "name": "Account",
      "pluralName": "Accounts",
      "reason": "Core business account/company",
      "suggestedFields": ["name", "industry", "website", "phone", "status"]
    },
    {
      "key": "contact",
      "name": "Contact",
      "pluralName": "Contacts",
      "reason": "People linked to accounts",
      "suggestedFields": ["first_name", "last_name", "email", "phone", "title"]
    },
    {
      "key": "deal",
      "name": "Deal",
      "pluralName": "Deals",
      "reason": "Sales pipeline opportunities",
      "suggestedFields": ["title", "amount", "stage", "close_date", "probability"]
    }
  ],
  "suggestedPages": [
    { "key": "dashboard", "type": "dashboard", "title": "Dashboard", "path": "/dashboard" },
    { "key": "account_list", "type": "entity-list", "title": "Accounts", "path": "/accounts", "entity": "account" },
    { "key": "account_detail", "type": "entity-detail", "title": "Account Detail", "path": "/accounts/:id", "entity": "account" },
    { "key": "account_create", "type": "entity-create", "title": "New Account", "path": "/accounts/new", "entity": "account" }
  ],
  "suggestedRelations": [
    { "source": "contact", "kind": "belongs_to", "target": "account", "reason": "Contacts belong to accounts" },
    { "source": "deal", "kind": "belongs_to", "target": "account", "reason": "Deals are tied to accounts" }
  ],
  "suggestedNavigation": {
    "items": [
      { "type": "page", "key": "nav_dashboard", "pageKey": "dashboard", "label": "Dashboard" },
      { "type": "page", "key": "nav_account_list", "pageKey": "account_list", "label": "Accounts" },
      { "type": "page", "key": "nav_contact_list", "pageKey": "contact_list", "label": "Contacts" },
      { "type": "page", "key": "nav_deal_list", "pageKey": "deal_list", "label": "Deals" }
    ]
  }
}
```

Response truncated. The full response includes pages for all entities (list, detail, create).

The `matchedDomain` field indicates which built-in domain template was selected. Supported domains include CRM, ticketing, inventory, project management, HR, and ecommerce.

---

## POST /api/guidance/suggest-pages

Generates a standard page set (list, detail, create) for each entity, plus a dashboard and navigation.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entities` | string[] | Yes | Array of entity keys |

### Request

```bash-vue
curl -X POST {{ baseUrl }}/api/guidance/suggest-pages \
  -H "Content-Type: application/json" \
  -d '{ "entities": ["customer", "invoice"] }'
```

### Response

```json
{
  "pages": [
    { "key": "dashboard", "type": "dashboard", "title": "Dashboard", "path": "/dashboard" },
    { "key": "customer_list", "type": "entity-list", "title": "Customers", "path": "/customers", "entity": "customer" },
    { "key": "customer_detail", "type": "entity-detail", "title": "Customer Detail", "path": "/customers/:id", "entity": "customer" },
    { "key": "customer_create", "type": "entity-create", "title": "New Customer", "path": "/customers/new", "entity": "customer" },
    { "key": "invoice_list", "type": "entity-list", "title": "Invoices", "path": "/invoices", "entity": "invoice" },
    { "key": "invoice_detail", "type": "entity-detail", "title": "Invoice Detail", "path": "/invoices/:id", "entity": "invoice" },
    { "key": "invoice_create", "type": "entity-create", "title": "New Invoice", "path": "/invoices/new", "entity": "invoice" }
  ],
  "navigation": {
    "items": [
      { "type": "page", "key": "nav_dashboard", "pageKey": "dashboard", "label": "Dashboard" },
      { "type": "page", "key": "nav_customer_list", "pageKey": "customer_list", "label": "Customers" },
      { "type": "page", "key": "nav_invoice_list", "pageKey": "invoice_list", "label": "Invoices" }
    ]
  }
}
```

Each entity gets three pages: list, detail, and create. A dashboard page and navigation are included automatically.

---

## POST /api/guidance/suggest-relations

Analyzes entity definitions and suggests relations based on field naming patterns.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entities` | object[] | Yes | Array of objects with `key` (string) and `fields` (string[]) |

### Request

```bash-vue
curl -X POST {{ baseUrl }}/api/guidance/suggest-relations \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      { "key": "customer", "fields": ["name", "email"] },
      { "key": "invoice", "fields": ["number", "amount", "customer_id"] }
    ]
  }'
```

### Response

```json
[
  {
    "source": "invoice",
    "kind": "belongs_to",
    "target": "customer",
    "reason": "Field \"customer_id\" suggests a belongs_to relation to \"customer\""
  }
]
```

The analysis looks for `_id` suffixed fields that match other entity keys. Returns an empty array if no relations are detected.

---

## POST /api/guidance/explain-errors

Converts raw validation errors into actionable explanations with fix suggestions and pointers to relevant schema tools.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `errors` | object[] | Yes | Array of objects with `field` (string) and `message` (string) |

### Request

```bash-vue
curl -X POST {{ baseUrl }}/api/guidance/explain-errors \
  -H "Content-Type: application/json" \
  -d '{
    "errors": [
      { "field": "metadata", "message": "Required" },
      { "field": "apiVersion", "message": "Invalid literal value, expected \"ikary.co/v1alpha1\"" }
    ]
  }'
```

### Response

```json
[
  {
    "path": "metadata",
    "problem": "Required",
    "fix": "Review the field path and consult the relevant schema using get_manifest_schema or get_entity_definition_schema.",
    "relatedTools": ["get_manifest_schema"]
  },
  {
    "path": "apiVersion",
    "problem": "Invalid literal value, expected \"ikary.co/v1alpha1\"",
    "fix": "Review the field path and consult the relevant schema using get_manifest_schema or get_entity_definition_schema.",
    "relatedTools": ["get_manifest_schema"]
  }
]
```

The `relatedTools` array lists MCP tool names that can provide schema context for the error. This is designed for AI agent workflows that validate, explain, and fix in a loop.

### Typical workflow

1. Call [POST /api/validate/manifest](/api/validation#post-apivalidatemanifest) to check a manifest
2. If invalid, pass the errors to this endpoint
3. Use the fix suggestions and related schemas to correct the manifest
4. Validate again
