import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DiscoveryService } from '../../services/discovery.service';
import type { RegistryService } from '../../services/registry.service';

interface ResourceServices {
  discovery: DiscoveryService;
  registry: RegistryService;
}

export function registerDocResources(server: McpServer, services: ResourceServices): void {
  server.resource(
    'ikary-manifest-format',
    'ikary://docs/manifest-format',
    async () => ({
      contents: [{
        uri: 'ikary://docs/manifest-format',
        mimeType: 'text/markdown',
        text: generateManifestFormatDoc(services.discovery),
      }],
    }),
  );

  server.resource(
    'ikary-entity-schema',
    'ikary://docs/entity-schema',
    async () => ({
      contents: [{
        uri: 'ikary://docs/entity-schema',
        mimeType: 'text/markdown',
        text: generateEntitySchemaDoc(services.discovery),
      }],
    }),
  );

  server.resource(
    'ikary-page-types',
    'ikary://docs/page-types',
    async () => ({
      contents: [{
        uri: 'ikary://docs/page-types',
        mimeType: 'text/markdown',
        text: generatePageTypesDoc(services.discovery),
      }],
    }),
  );

  server.resource(
    'ikary-field-types',
    'ikary://docs/field-types',
    async () => ({
      contents: [{
        uri: 'ikary://docs/field-types',
        mimeType: 'text/markdown',
        text: FIELD_TYPES_DOC,
      }],
    }),
  );

  server.resource(
    'ikary-primitive-catalog',
    'ikary://docs/primitive-catalog',
    async () => ({
      contents: [{
        uri: 'ikary://docs/primitive-catalog',
        mimeType: 'text/markdown',
        text: generatePrimitiveCatalogDoc(services.registry),
      }],
    }),
  );
}

function generateManifestFormatDoc(discovery: DiscoveryService): string {
  const schema = discovery.getManifestSchema();
  return [
    '# IKARY Cell Manifest Format',
    '',
    `Version: ${schema.version}`,
    '',
    '## Root Structure',
    '',
    ...schema.fields.map((f) => `- **${f.key}** (\`${f.type}\`${f.required ? ', required' : ''}) — ${f.description ?? ''}`),
    '',
    '## Spec Fields',
    '',
    ...schema.spec.map((f) => `- **${f.key}** (\`${f.type}\`${f.required ? ', required' : ''}) — ${f.description ?? ''}`),
    '',
    '## Semantic Rules',
    '',
    ...schema.semanticRules.map((r) => `- ${r}`),
    '',
    '## Notes',
    '',
    ...(schema.notes ?? []).map((n) => `- ${n}`),
  ].join('\n');
}

function generateEntitySchemaDoc(discovery: DiscoveryService): string {
  const schema = discovery.getEntitySchema();
  return [
    '# Entity Definition Schema',
    '',
    '## Fields',
    '',
    ...schema.fields.map((f) => `- **${f.key}** (\`${f.type}\`${f.required ? ', required' : ''}) — ${f.description ?? ''}`),
    '',
    '## Semantic Rules',
    '',
    ...schema.semanticRules.map((r) => `- ${r}`),
  ].join('\n');
}

function generatePageTypesDoc(discovery: DiscoveryService): string {
  const schema = discovery.getPageSchema() as any;
  const pageTypes = schema.pageTypes ?? [];
  return [
    '# Page Types',
    '',
    '## Available Types',
    '',
    ...pageTypes.map((pt: any) => `- **${pt.type}** — ${pt.description} (entity ${pt.entityRequired ? 'required' : 'not required'})`),
    '',
    '## Page Fields',
    '',
    ...(schema.fields ?? []).map((f: any) => `- **${f.key}** (\`${f.type}\`${f.required ? ', required' : ''}) — ${f.description ?? ''}`),
    '',
    '## Semantic Rules',
    '',
    ...(schema.semanticRules ?? []).map((r: any) => `- ${r}`),
  ].join('\n');
}

function generatePrimitiveCatalogDoc(registry: RegistryService): string {
  const primitives = registry.listPrimitives();
  const byCategory = new Map<string, typeof primitives>();
  for (const p of primitives) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }

  const sections = Array.from(byCategory.entries()).map(([cat, items]) => [
    `## ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
    '',
    ...items.map((p) => `- **${p.key}** — ${p.description}`),
    '',
  ].join('\n'));

  return ['# UI Primitive Catalog', '', `${primitives.length} primitives available.`, '', ...sections].join('\n');
}

const FIELD_TYPES_DOC = `# Field Types

## Available Types

- **string** — Short text (name, email, URL)
- **text** — Long text (descriptions, notes)
- **number** — Numeric value (integer or decimal)
- **boolean** — True/false flag
- **date** — Date only (YYYY-MM-DD)
- **datetime** — Date and time (ISO 8601)
- **enum** — Fixed set of values (requires enumValues array)
- **object** — Nested object with child fields (max depth 3)

## Field Properties

- **key** (string, required) — Unique field identifier (snake_case)
- **name** (string, required) — Display name
- **type** (FieldType, required) — One of the types above
- **required** (boolean) — Whether the field is mandatory
- **description** (string) — Field description
- **helpText** (string) — Help text shown in forms
- **enumValues** (string[]) — Required for enum type
- **fields** (FieldDefinition[]) — Required for object type (nested fields)

## Display Configuration

- **display.type** — How to render: text, number, currency, badge, date, datetime, boolean, link, email, phone, url
- **display.align** — Column alignment: left, center, right

## Form Configuration

- **form.visible** — Show in forms (default true)
- **form.order** — Display order in forms
- **form.placeholder** — Placeholder text

## List Configuration

- **list.visible** — Show in list columns (default true)
`;
