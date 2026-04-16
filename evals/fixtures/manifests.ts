import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { parseManifest } from '@ikary/cell-contract';

const fixturesDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(fixturesDir, '..', '..');
const examplesRoot = resolve(repoRoot, 'manifests', 'examples');

export function loadExampleManifest(relativePath: string): Record<string, unknown> {
  const filePath = resolve(examplesRoot, relativePath);
  const raw = readFileSync(filePath, 'utf8');
  const parsed = parseYaml(raw) as Record<string, unknown>;
  delete parsed.$schema;

  const result = parseManifest(parsed);
  if (!result.valid || !result.manifest) {
    throw new Error(`Fixture manifest failed validation: ${relativePath}`);
  }

  return result.manifest as unknown as Record<string, unknown>;
}

export const minimalNotesManifest = loadExampleManifest('docs/01-minimal.yaml');
export const taskTrackerManifest = loadExampleManifest('projects/01-task-tracker.yaml');
export const crmContactsManifest = loadExampleManifest('crm/01-contacts.yaml');

export const brokenTaskTrackerMissingTaskEntity = (() => {
  const manifest = structuredClone(taskTrackerManifest);
  const entities = getSpecCollection(manifest, 'entities');
  manifest.spec.entities = entities.filter((entity) => getString(entity, 'key') !== 'task');
  return manifest;
})();

export const updatedNotesWithCategoryManifest = (() => {
  const manifest = structuredClone(minimalNotesManifest);
  manifest.metadata = {
    ...asRecord(manifest.metadata),
    key: 'doc_notes_categories',
    name: 'Notes With Categories',
    description: 'Notes app extended with categories.',
  };

  const entities = getSpecCollection(manifest, 'entities');
  const note = entities.find((entity) => getString(entity, 'key') === 'note');
  if (!note) {
    throw new Error('Expected note entity in minimal notes manifest.');
  }

  const noteRelations = Array.isArray(note.relations) ? note.relations : [];
  note.relations = [
    ...noteRelations,
    {
      key: 'category_id',
      relation: 'belongs_to',
      entity: 'category',
      required: false,
    },
  ];

  entities.push({
    key: 'category',
    name: 'Category',
    pluralName: 'Categories',
    fields: [
      {
        key: 'name',
        name: 'Name',
        type: 'string',
        required: true,
        list: { visible: true, searchable: true },
        form: { visible: true },
      },
      {
        key: 'color',
        name: 'Color',
        type: 'string',
        list: { visible: true },
        form: { visible: true, placeholder: '#4f46e5' },
      },
    ],
    relations: [
      {
        key: 'notes',
        relation: 'has_many',
        entity: 'note',
        foreignKey: 'category_id',
      },
    ],
  });

  const pages = getSpecCollection(manifest, 'pages');
  pages.push(
    {
      key: 'category_list',
      type: 'entity-list',
      title: 'Categories',
      path: '/categories',
      entity: 'category',
    },
    {
      key: 'category_detail',
      type: 'entity-detail',
      title: 'Category',
      path: '/categories/:id',
      entity: 'category',
    },
    {
      key: 'category_create',
      type: 'entity-create',
      title: 'New Category',
      path: '/categories/new',
      entity: 'category',
    },
  );

  const navigation = asRecord(manifest.spec.navigation);
  const items = Array.isArray(navigation.items) ? navigation.items : [];
  navigation.items = [
    ...items,
    {
      type: 'page',
      key: 'nav_category_list',
      pageKey: 'category_list',
      label: 'Categories',
    },
  ];
  manifest.spec.navigation = navigation;

  return manifest;
})();

function asRecord(value: unknown): Record<string, unknown> {
  return (value && typeof value === 'object') ? value as Record<string, unknown> : {};
}

function getSpecCollection(
  manifest: Record<string, unknown>,
  key: 'entities' | 'pages',
): Array<Record<string, unknown>> {
  const spec = asRecord(manifest.spec);
  const collection = spec[key];
  if (!Array.isArray(collection)) {
    throw new Error(`Manifest spec.${key} is missing.`);
  }
  return collection as Array<Record<string, unknown>>;
}

function getString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}
