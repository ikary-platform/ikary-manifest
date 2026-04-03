import { BASE_ENTITY_FIELDS } from '@ikary-manifest/contract';
import type {
  CellManifestV1,
  EntityDefinition,
  FieldDefinition,
  NavigationItem,
  PageDefinition,
} from '@ikary-manifest/contract';
import { deriveCreateFields, deriveEditFields } from '@ikary-manifest/engine';
import type { ResolvedCreateField } from '@ikary-manifest/engine';

export interface ManifestRoute {
  path: string;
  pageKey: string;
  page: PageDefinition;
}

export interface ManifestNavigationItem {
  type: 'page' | 'group';
  key: string;
  label: string;
  icon?: string;
  order: number;
  path?: string;
  children?: ManifestNavigationItem[];
}

export interface ManifestRuntimeEntity extends EntityDefinition {
  fields: FieldDefinition[];
  listFields: FieldDefinition[];
  formFields: FieldDefinition[];
  createFields: ResolvedCreateField[];
  editFields: ResolvedCreateField[];
}

export function getManifestPages(manifest: CellManifestV1): PageDefinition[] {
  return manifest.spec.pages ?? [];
}

export function findPageByKey(manifest: CellManifestV1, pageKey: string): PageDefinition | undefined {
  return getManifestPages(manifest).find((page) => page.key === pageKey);
}

export function resolveLandingPath(manifest: CellManifestV1): string {
  return findPageByKey(manifest, manifest.spec.mount.landingPage)?.path ?? '/';
}

export function getManifestRoutes(manifest: CellManifestV1): ManifestRoute[] {
  return getManifestPages(manifest).map((page) => ({
    path: page.type === 'entity-detail' ? `${page.path}/*` : page.path,
    pageKey: page.key,
    page,
  }));
}

function resolveNavigationItem(
  item: NavigationItem,
  pageMap: Map<string, PageDefinition>,
  index: number,
): ManifestNavigationItem {
  if (item.type === 'page') {
    const page = pageMap.get(item.pageKey);
    return {
      type: 'page',
      key: item.key,
      label: item.label ?? page?.title ?? item.pageKey,
      icon: item.icon,
      order: item.order ?? index,
      path: page?.path,
    };
  }

  return {
    type: 'group',
    key: item.key,
    label: item.label,
    icon: item.icon,
    order: item.order ?? index,
    children: item.children.map((child, childIndex) => resolveNavigationItem(child, pageMap, childIndex)),
  };
}

export function getManifestNavigation(manifest: CellManifestV1): ManifestNavigationItem[] {
  const pageMap = new Map(getManifestPages(manifest).map((page) => [page.key, page]));
  const items = manifest.spec.navigation?.items ?? [];

  return items.map((item, index) => resolveNavigationItem(item, pageMap, index)).sort((a, b) => a.order - b.order);
}

export function findManifestEntity(manifest: CellManifestV1, entityKey: string): EntityDefinition | undefined {
  return (manifest.spec.entities ?? []).find((entity) => entity.key === entityKey);
}

function withBaseEntityFields(entity: EntityDefinition): FieldDefinition[] {
  return [...entity.fields, ...BASE_ENTITY_FIELDS];
}

export function resolveManifestEntityFromDefinition(entity: EntityDefinition): ManifestRuntimeEntity {
  const fields = withBaseEntityFields(entity);
  return {
    ...entity,
    fields,
    relations: entity.relations ?? [],
    computed: entity.computed ?? [],
    capabilities: entity.capabilities ?? [],
    listFields: fields.filter((field) => field.list?.visible !== false && field.type !== 'object'),
    formFields: fields.filter((field) => field.form?.visible !== false),
    createFields: deriveCreateFields(fields),
    editFields: deriveEditFields(fields),
  };
}

export function resolveManifestEntity(manifest: CellManifestV1, entityKey: string): ManifestRuntimeEntity | undefined {
  const entity = findManifestEntity(manifest, entityKey);
  return entity ? resolveManifestEntityFromDefinition(entity) : undefined;
}

export function resolveManifestEntities(manifest: CellManifestV1): ManifestRuntimeEntity[] {
  return (manifest.spec.entities ?? []).map((entity) => resolveManifestEntityFromDefinition(entity));
}
