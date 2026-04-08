import { BASE_ENTITY_FIELDS } from '@ikary/cell-contract-core';
import type {
  CapabilityDefinition,
  CellManifestV1,
  ComputedFieldDefinition,
  EntityDefinition,
  FieldDefinition,
  NavigationItem,
  PageDefinition,
  RelationDefinition,
  RoleDefinition,
} from '@ikary/cell-contract-core';
import { deriveCreateFields, deriveEditFields, deriveEntityScopeRegistry } from '@ikary/cell-engine';
import type { ResolvedCreateField } from '@ikary/cell-engine';

export interface ManifestPreviewEntity extends EntityDefinition {
  fields: FieldDefinition[];
  relations: RelationDefinition[];
  computed: ComputedFieldDefinition[];
  capabilities: CapabilityDefinition[];
  listFields: FieldDefinition[];
  formFields: FieldDefinition[];
  createFields: ResolvedCreateField[];
  editFields: ResolvedCreateField[];
  scopeRegistry: string[];
}

export interface ManifestPreviewRoute {
  path: string;
  pageKey: string;
}

export interface ManifestPreviewNavigationItem {
  type: 'page' | 'group';
  key: string;
  label: string;
  icon?: string;
  order: number;
  path?: string;
  children?: ManifestPreviewNavigationItem[];
}

export interface ManifestPreviewData {
  metadata: {
    key: string;
    name: string;
    description?: string;
  };
  entities: ManifestPreviewEntity[];
  pages: PageDefinition[];
  routes: ManifestPreviewRoute[];
  navigation: ManifestPreviewNavigationItem[];
  roles: RoleDefinition[];
  scopeRegistry: string[];
}

function deriveEntityPreview(entity: EntityDefinition): ManifestPreviewEntity {
  const fields = [...entity.fields, ...BASE_ENTITY_FIELDS];
  const relations = entity.relations ?? [];
  const computed = entity.computed ?? [];
  const capabilities = entity.capabilities ?? [];
  const createFields = deriveCreateFields(fields);
  const editFields = deriveEditFields(fields);

  return {
    ...entity,
    fields,
    relations,
    computed,
    capabilities,
    listFields: fields.filter((field) => field.list?.visible !== false && field.type !== 'object'),
    formFields: fields.filter((field) => field.form?.visible !== false),
    createFields,
    editFields,
    scopeRegistry: deriveEntityScopeRegistry(entity),
  };
}

function resolveNavItem(
  item: NavigationItem,
  pageMap: Map<string, PageDefinition>,
  index: number,
): ManifestPreviewNavigationItem {
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
    children: item.children.map((child, childIndex) => resolveNavItem(child, pageMap, childIndex)),
  };
}

export function deriveManifestPreviewData(manifest: CellManifestV1): ManifestPreviewData {
  const pages = manifest.spec.pages ?? [];
  const pageMap = new Map(pages.map((page) => [page.key, page]));

  const entities = (manifest.spec.entities ?? []).map((entity) => deriveEntityPreview(entity));
  const roles = manifest.spec.roles ?? [];

  return {
    metadata: {
      key: manifest.metadata.key,
      name: manifest.metadata.name,
      description: manifest.metadata.description,
    },
    entities,
    pages,
    routes: pages.map((page) => ({
      path: page.type === 'entity-detail' ? `${page.path}/*` : page.path,
      pageKey: page.key,
    })),
    navigation: (manifest.spec.navigation?.items ?? [])
      .map((item, index) => resolveNavItem(item, pageMap, index))
      .sort((a, b) => a.order - b.order),
    roles,
    scopeRegistry: [...new Set(entities.flatMap((entity) => entity.scopeRegistry))],
  };
}
