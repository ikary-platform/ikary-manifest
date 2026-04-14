# testing2



## Manifest format

This project uses IKARY Manifest (`ikary.co/v1alpha1`). The file
`manifest.json` is the source of truth. Every change MUST produce
valid JSON conforming to the `CellManifestV1` schema.

## Top-level structure

```json
{
  "apiVersion": "ikary.co/v1alpha1",
  "kind": "Cell",
  "metadata": { "key": "...", "name": "...", "version": "1.0.0" },
  "spec": {
    "mount": { "mountPath": "/", "landingPage": "dashboard" },
    "entities": [ ... ],
    "pages": [ ... ],
    "navigation": { "items": [ ... ] },
    "roles": [ ... ]
  }
}
```

## Entity definition

Each entity in `spec.entities` has this shape:

```json
{
  "key": "customer",
  "name": "Customer",
  "pluralName": "Customers",
  "fields": [
    { "key": "name", "type": "string", "name": "Name" },
    { "key": "email", "type": "string", "name": "Email" },
    { "key": "status", "type": "enum", "name": "Status", "enumValues": ["active", "inactive"] }
  ],
  "relations": [
    { "key": "invoices", "relation": "has_many", "entity": "invoice", "foreignKey": "customer_id" }
  ],
  "lifecycle": {
    "field": "status",
    "initial": "active",
    "states": ["active", "inactive"],
    "transitions": [
      { "key": "deactivate", "from": "active", "to": "inactive" }
    ]
  },
  "policies": {
    "view": { "scope": "workspace" },
    "create": { "scope": "role", "condition": "admin" },
    "update": { "scope": "owner" },
    "delete": { "scope": "role", "condition": "admin" }
  }
}
```

## Field types

`string`, `text`, `number`, `boolean`, `date`, `datetime`, `enum`, `object`

## Relation types

`belongs_to`, `has_many`, `many_to_many`, `self`, `polymorphic`

## Page types

`entity-list`, `entity-detail`, `entity-create`, `entity-edit`, `dashboard`, `custom`

## Validation commands

Run `ikary validate manifest.json` to check your work.
Run `ikary validate manifest.json --explain` for fix suggestions on errors.
Run `ikary compile manifest.json` to compile and normalize.

## Rules

- All entity keys MUST be snake_case
- All field keys MUST be snake_case
- Each entity needs at minimum: key, name, pluralName, fields
- The lifecycle field must reference an existing field key
- Relation entity references must match another entity's key
- Pages referencing entities must use a valid entity key
- Navigation pageKey values must match a page key

## IKARY Public API

A public REST API is available at `https://public.ikary.co`. No authentication
required. Use it for validation, schema discovery, and generation guidance.

Key endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/validate/manifest` | POST | Validate a full manifest (`{ "manifest": {...} }`) |
| `/api/validate/normalize` | POST | Compile and normalize a manifest |
| `/api/guidance/recommend` | POST | Get entity/page recommendations from a goal description (`{ "goal": "..." }`) |
| `/api/guidance/explain-errors` | POST | Get fix suggestions for validation errors |
| `/api/guidance/suggest-pages` | POST | Generate CRUD pages for entities (`{ "entities": [...] }`) |
| `/api/guidance/suggest-relations` | POST | Infer relations between entities |
| `/api/schemas/manifest` | GET | Full manifest schema with semantic rules |
| `/api/schemas/entity` | GET | Entity definition schema |
| `/api/schemas/page` | GET | Page definition schema |
| `/api/schemas/capability` | GET | Capability definition schema |
| `/api/primitives` | GET | UI primitive catalog (filterable by `?category=`) |
| `/api/examples` | GET | List example manifests |
| `/api/examples/{key}` | GET | Fetch a specific example manifest |

After every manifest edit, validate with `POST /api/validate/manifest`.
When validation fails, pass the errors to `POST /api/guidance/explain-errors`
for actionable fix suggestions.

## MCP server

An MCP server is configured in `.mcp.json` at `https://public.ikary.co/mcp`.
It exposes 19 tools across five categories:

**Discovery:** `get_manifest_schema`, `get_entity_definition_schema`,
`get_page_schema`, `get_capability_schema`

**Registry:** `list_primitives`, `get_primitive_contract`, `list_examples`,
`get_example_manifest`

**Primitives:** `get_primitive_examples`, `scaffold_primitive`,
`validate_primitive_props`

**Guidance:** `recommend_manifest_structure`, `suggest_page_set_for_entities`,
`suggest_relations`, `explain_validation_errors`

**Validation:** `validate_manifest`, `validate_entity`, `validate_page`,
`normalize_manifest`

Use MCP tools for interactive guidance. Use the REST API for programmatic
access (curl, fetch, CLI).

## Custom UI primitives

Custom primitives live in `primitives/<name>/` and are registered in `ikary-primitives.yaml`.
Each primitive is a self-contained folder of six files:

```
primitives/<name>/
  <Name>.tsx                    # React component
  <Name>PresentationSchema.ts   # Zod schema — source of truth for prop types
  <name>.contract.yaml          # Human-readable props contract (drives Studio editor)
  <Name>.resolver.ts            # ContractProps → ResolvedProps transform
  <Name>.register.ts            # Calls registerPrimitiveVersion() — side-effect import
  <Name>.example.ts             # Named example scenarios for the Studio preview
```

### Claude Code skills

Use these slash commands inside Claude Code to build and maintain primitives:

| Skill | What it does |
|-------|-------------|
| `/create-primitive` | Scaffold a new primitive, implement the component, validate, and preview it live |
| `/update-primitive` | Update props or logic — guides through non-breaking vs breaking changes |
| `/browse-primitives` | List all core and custom primitives; show contracts and example props |

**To create a primitive with Claude Code:**

```
# 1. Make sure the local stack is running
ikary local start manifest.json

# 2. Open Claude Code in this directory
claude

# 3. Run the skill
/create-primitive
```

Claude will ask what the primitive should do, scaffold all six files using the
`scaffold_primitive` MCP tool, implement the component, then open the live preview.

**To update an existing primitive:**

```
/update-primitive
```

Claude will read the current files, determine whether the change is breaking or
non-breaking, and walk through versioning if needed.

### CLI commands

| Command | Purpose |
|---------|---------|
| `ikary primitive add <name>` | Scaffold a new primitive (6 files + config entry) |
| `ikary primitive validate` | Validate all entries in ikary-primitives.yaml |
| `ikary primitive list` | List core and custom primitives |
| `ikary primitive studio` | Open the Primitive Studio in the browser |

### MCP tools for primitives

| Tool | Purpose |
|------|---------|
| `list_primitives` | List all primitives; pass `source: "custom"` for project-specific ones |
| `get_primitive_contract` | Get full props schema for a primitive |
| `get_primitive_examples` | Get example scenarios for a custom primitive |
| `scaffold_primitive` | Create a new primitive scaffold (same as `ikary primitive add`) |
| `validate_primitive_props` | Validate a props object against a primitive's contract |

### Primitive Studio

The Primitive Studio is a live 3-panel preview environment:

```
ikary local start manifest.json
# then open:
http://localhost:4500/__primitive-studio
```

- **Left panel** — grouped list of all core and custom primitives
- **Center panel** — scenario tabs + editable props JSON
- **Right panel** — live component preview; updates as you edit props

Custom primitives appear automatically once registered in `ikary-primitives.yaml`.
The preview hot-reloads when you edit `ikary-primitives.yaml` or save any primitive file.

## Local stack

Run `ikary local start manifest.json` to boot the full local stack:

| Service | URL |
|---------|-----|
| Preview | http://localhost:4500 |
| Data API | http://localhost:4501 |
| MCP Server | http://localhost:4502/mcp |

The preview server hot-reloads when `manifest.json` changes.
The data API persists records in a local SQLite database.
Run `ikary local stop` to shut down. `ikary local reset-data` wipes the SQLite data.

Quick preview (no Docker): `ikary preview manifest.json` opens a self-contained HTML file
in the browser with mock data — no server needed.

## Recommended workflow

1. Run `ikary local start manifest.json` to boot the local stack.
2. Run `recommend_manifest_structure` with the application goal to scaffold
   entities, relations, pages, and navigation.
3. Edit `manifest.json` with the generated structure — preview hot-reloads at http://localhost:4500.
4. Validate with `ikary validate manifest.json` or the `validate_manifest` MCP tool.
5. If errors occur, run `explain_validation_errors` or use `ikary validate manifest.json --explain`.
6. Compile with `ikary compile manifest.json` or `normalize_manifest`.
7. Use `list_primitives` to find the right UI components for page layouts.

## Source reference

Contract definitions and example manifests live in the public repository:
https://github.com/ikary-platform/ikary-manifest

- Schema contracts: `libs/contract/src/`
- Compilation engine: `libs/engine/src/`
- Example manifests: `manifests/examples/`
