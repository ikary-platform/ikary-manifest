import type { InitOptions } from './prompts.js';

// ── Starter manifest JSON ──────────────────────────────────────────────

export function generateManifestJson(options: InitOptions): string {
  const key = options.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const manifest = {
    apiVersion: 'ikary.co/v1alpha1',
    kind: 'Cell',
    metadata: {
      key,
      name: options.name,
      version: '1.0.0',
      description: options.description,
    },
    spec: {
      mount: {
        mountPath: '/',
        landingPage: 'dashboard',
      },
      entities: [],
      pages: [
        {
          key: 'dashboard',
          type: 'dashboard',
          title: 'Dashboard',
          path: '/dashboard',
        },
      ],
      navigation: {
        items: [
          { type: 'page', key: 'dashboard-nav', pageKey: 'dashboard', icon: 'home' },
        ],
      },
      roles: [
        { key: 'admin', name: 'Admin', scopes: [`${key}.admin`] },
        { key: 'viewer', name: 'Viewer', scopes: [`${key}.view`] },
      ],
    },
  };

  return JSON.stringify(manifest, null, 2);
}

// ── CLAUDE.md ──────────────────────────────────────────────────────────

export function generateClaudeMd(options: InitOptions): string {
  return `# ${options.name}

${options.description}

## Manifest format

This project uses IKARY Manifest (\`ikary.co/v1alpha1\`). The file
\`manifest.json\` is the source of truth. Every change MUST produce
valid JSON conforming to the \`CellManifestV1\` schema.

## Top-level structure

\`\`\`json
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
\`\`\`

## Entity definition

Each entity in \`spec.entities\` has this shape:

\`\`\`json
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
\`\`\`

## Field types

\`string\`, \`text\`, \`number\`, \`boolean\`, \`date\`, \`datetime\`, \`enum\`, \`object\`

## Relation types

\`belongs_to\`, \`has_many\`, \`many_to_many\`, \`self\`, \`polymorphic\`

## Page types

\`entity-list\`, \`entity-detail\`, \`entity-create\`, \`entity-edit\`, \`dashboard\`, \`custom\`

## Validation commands

Run \`ikary validate manifest.json\` to check your work.
Run \`ikary validate manifest.json --explain\` for fix suggestions on errors.
Run \`ikary compile manifest.json\` to compile and normalize.

## Rules

- All entity keys MUST be snake_case
- All field keys MUST be snake_case
- Each entity needs at minimum: key, name, pluralName, fields
- The lifecycle field must reference an existing field key
- Relation entity references must match another entity's key
- Pages referencing entities must use a valid entity key
- Navigation pageKey values must match a page key

## IKARY Public API

A public REST API is available at \`https://public.ikary.co\`. No authentication
required. Use it for validation, schema discovery, and generation guidance.

Key endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| \`/api/validate/manifest\` | POST | Validate a full manifest (\`{ "manifest": {...} }\`) |
| \`/api/validate/normalize\` | POST | Compile and normalize a manifest |
| \`/api/guidance/recommend\` | POST | Get entity/page recommendations from a goal description (\`{ "goal": "..." }\`) |
| \`/api/guidance/explain-errors\` | POST | Get fix suggestions for validation errors |
| \`/api/guidance/suggest-pages\` | POST | Generate CRUD pages for entities (\`{ "entities": [...] }\`) |
| \`/api/guidance/suggest-relations\` | POST | Infer relations between entities |
| \`/api/schemas/manifest\` | GET | Full manifest schema with semantic rules |
| \`/api/schemas/entity\` | GET | Entity definition schema |
| \`/api/schemas/page\` | GET | Page definition schema |
| \`/api/schemas/capability\` | GET | Capability definition schema |
| \`/api/primitives\` | GET | UI primitive catalog (filterable by \`?category=\`) |
| \`/api/examples\` | GET | List example manifests |
| \`/api/examples/{key}\` | GET | Fetch a specific example manifest |

After every manifest edit, validate with \`POST /api/validate/manifest\`.
When validation fails, pass the errors to \`POST /api/guidance/explain-errors\`
for actionable fix suggestions.

## MCP server

An MCP server is configured in \`.mcp.json\` at \`https://public.ikary.co/mcp\`.
It exposes 16 tools across four categories:

**Discovery:** \`get_manifest_schema\`, \`get_entity_definition_schema\`,
\`get_page_schema\`, \`get_capability_schema\`

**Registry:** \`list_primitives\`, \`get_primitive_contract\`, \`list_examples\`,
\`get_example_manifest\`

**Guidance:** \`recommend_manifest_structure\`, \`suggest_page_set_for_entities\`,
\`suggest_relations\`, \`explain_validation_errors\`

**Validation:** \`validate_manifest\`, \`validate_entity\`, \`validate_page\`,
\`normalize_manifest\`

Use MCP tools for interactive guidance. Use the REST API for programmatic
access (curl, fetch, CLI).

## Recommended workflow

1. Run \`recommend_manifest_structure\` with the application goal to scaffold
   entities, relations, pages, and navigation.
2. Edit \`manifest.json\` with the generated structure.
3. Validate with \`ikary validate manifest.json\` or the \`validate_manifest\` MCP tool.
4. If errors occur, run \`explain_validation_errors\` or use \`ikary validate manifest.json --explain\`.
5. Compile with \`ikary compile manifest.json\` or \`normalize_manifest\`.
6. Use \`list_primitives\` to find the right UI components for page layouts.

## Source reference

Contract definitions and example manifests live in the public repository:
https://github.com/ikary-platform/ikary-manifest

- Schema contracts: \`libs/contract/src/\`
- Compilation engine: \`libs/engine/src/\`
- Example manifests: \`manifests/examples/\`
`;
}

// ── MCP configuration ─────────────────────────────────────────────────

export function generateMcpConfig(): string {
  return JSON.stringify({
    mcpServers: {
      'ikary-manifest': {
        url: 'https://public.ikary.co/mcp',
      },
    },
  }, null, 2);
}

// ── Claude Code slash commands ─────────────────────────────────────────

export function generateAddEntityCommand(): string {
  return `Add a new entity to the Cell Manifest.

Read manifest.json, then ask the user what entity to create.

Use the get_entity_definition_schema MCP tool to confirm the entity shape
before generating.

Generate a complete entity definition with:
- key (snake_case), name, pluralName
- fields with appropriate types
- relations to existing entities if relevant
- lifecycle if the entity has states
- policies (default: view=workspace, create/update=owner, delete=role)

Add the entity to spec.entities in manifest.json.
Add an entity-list page and entity-detail page for the new entity.
Add a navigation item for the list page.

After adding the entity, use the suggest_relations MCP tool with the full
entity list to discover relations you may have missed.

Run: ikary validate manifest.json --explain
If there are errors, use the explain_validation_errors MCP tool for fixes.
`;
}

export function generateValidateCommand(): string {
  return `Validate the Cell Manifest.

Run: ikary validate manifest.json --explain

This validates the manifest against the IKARY API and shows fix suggestions
for any errors found.

Alternatively, use the validate_manifest MCP tool directly for validation
and explain_validation_errors for detailed fix suggestions.

If there are errors, fix them in manifest.json and re-validate.
`;
}

export function generateRecommendCommand(): string {
  return `Help me build a manifest for my application.

Ask the user what kind of application they want to build.

Use the recommend_manifest_structure MCP tool with their description as the
goal. This returns suggested entities, relations, pages, and navigation.

Take the recommendations and generate a complete manifest.json file with:
- All suggested entities with their fields, relations, and lifecycle
- CRUD pages (entity-list, entity-detail, entity-create) for each entity
- A dashboard page
- Navigation items for all list pages
- Roles (admin, viewer at minimum)

After generating, run: ikary validate manifest.json --explain
If there are errors, use the explain_validation_errors MCP tool and fix them.
`;
}

export function generateBrowsePrimitivesCommand(): string {
  return `Show the available IKARY UI primitives.

Use the list_primitives MCP tool to get the full catalog.

Organize them by category (collection, input, form, layout, page, display,
feedback) and explain which ones are relevant for the current manifest's
page types.

Read manifest.json first to understand what pages exist, then recommend
primitives that match.
`;
}

// ── Claude Code settings ───────────────────────────────────────────────

export function generateClaudeSettings(): string {
  return JSON.stringify({
    permissions: {
      allow: [
        "Bash(ikary validate *)",
        "Bash(ikary compile *)",
        "Bash(ikary preview *)"
      ]
    }
  }, null, 2);
}
