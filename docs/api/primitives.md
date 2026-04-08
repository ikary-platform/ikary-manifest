---
outline: deep
---

<script setup>
import { data } from './api.data.ts'
const { baseUrl } = data
</script>

# UI Primitives

Browse the catalog of 30 UI primitives and their presentation contracts. Each primitive defines what it does, when to use it, and when to avoid it.

## GET /api/primitives

Returns the full catalog of UI primitives. Accepts an optional category filter.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `category` | query | string | No | Filter by category: `collection`, `input`, `form`, `layout`, `page`, `display`, `feedback` |

### Request

```bash-vue
curl {{ baseUrl }}/api/primitives
```

Filter by category:

```bash-vue
curl "{{ baseUrl }}/api/primitives?category=form"
```

### Response

Without filter, returns all 30 primitives:

```json
[
  {
    "key": "data-grid",
    "category": "collection",
    "description": "Sortable, filterable tabular data grid with pagination",
    "bestFor": ["large entity lists", "sortable/filterable data"],
    "avoidWhen": ["card-heavy visual displays"]
  },
  {
    "key": "card-list",
    "category": "collection",
    "description": "Card-based collection layout for visual data",
    "bestFor": ["visual summaries", "dashboard widgets"],
    "avoidWhen": ["dense tabular data"]
  }
]
```

Response truncated. The full response contains 30 entries.

With `?category=form`:

```json
[
  { "key": "form", "category": "form", "description": "Complete form with sections, validation, and submit actions", "bestFor": ["entity create/edit pages"] },
  { "key": "form-field", "category": "form", "description": "Individual form field wrapper with label and validation", "bestFor": ["wrapping input primitives in forms"] },
  { "key": "form-section", "category": "form", "description": "Grouped section within a form", "bestFor": ["organizing related fields"] }
]
```

### Categories

| Category | Count | Contains |
|----------|-------|----------|
| `collection` | 5 | data-grid, card-list, pagination, filter-bar, bulk-command-bar |
| `input` | 7 | input, textarea, select, checkbox, radio-group, toggle, date-input, relation-field |
| `form` | 3 | form, form-field, form-section |
| `layout` | 5 | page-shell, sidebar, toolbar, split-pane, tabs |
| `page` | 3 | list-page, detail-page, dashboard-page |
| `display` | 4 | stat-card, badge, timeline, detail-field |
| `feedback` | 3 | toast, confirm-dialog, empty-state |

---

## GET /api/primitives/{key}

Returns the presentation contract for one UI primitive.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `key` | path | string | Yes | Primitive key (e.g., `data-grid`, `form`, `toast`) |

### Request

```bash-vue
curl {{ baseUrl }}/api/primitives/data-grid
```

### Response

```json
{
  "key": "data-grid",
  "category": "collection",
  "description": "Sortable, filterable tabular data grid with pagination",
  "bestFor": ["large entity lists", "sortable/filterable data"],
  "avoidWhen": ["card-heavy visual displays"]
}
```

Returns an error if the key does not match any known primitive. See [Error Handling](/api/errors) for the error shape.
