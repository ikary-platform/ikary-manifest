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
Run \`ikary compile manifest.json\` to compile.

## Rules

- All entity keys MUST be snake_case
- All field keys MUST be snake_case
- Each entity needs at minimum: key, name, pluralName, fields
- The lifecycle field must reference an existing field key
- Relation entity references must match another entity's key
- Pages referencing entities must use a valid entity key
- Navigation pageKey values must match a page key
`;
}

// ── Claude Code slash commands ─────────────────────────────────────────

export function generateAddEntityCommand(): string {
  return `Add a new entity to the Cell Manifest.

Read manifest.json, then ask the user what entity to create.
Generate a complete entity definition with:
- key (snake_case), name, pluralName
- fields with appropriate types
- relations to existing entities if relevant
- lifecycle if the entity has states
- policies (default: view=workspace, create/update=owner, delete=role)

Add the entity to spec.entities in manifest.json.
Add an entity-list page and entity-detail page for the new entity.
Add a navigation item for the list page.

After generation, run: ikary validate manifest.json
`;
}

export function generateValidateCommand(): string {
  return `Validate the Cell Manifest.

Run: ikary validate manifest.json

If there are errors, read the error output and fix them in manifest.json.
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
