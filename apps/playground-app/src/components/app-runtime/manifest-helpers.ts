import type {
  CellManifestV1,
  EntityDefinition,
  FieldDefinition,
  NavigationItem,
  PageDefinition,
} from '@ikary/contract';
import { deriveCreateFields, deriveEditFields } from '@ikary/engine';
import type { ResolvedCreateField } from '@ikary/engine';

// ── Resolved entity with derived field lists ─────────────────────────────────

export interface ResolvedEntity extends EntityDefinition {
  listFields: FieldDefinition[];
  formFields: FieldDefinition[];
  createFields: ResolvedCreateField[];
  editFields: ResolvedCreateField[];
}

// ── Navigation helpers ───────────────────────────────────────────────────────

export interface NavPageItem {
  type: 'page';
  key: string;
  label: string;
  path: string;
  icon?: string;
}

export interface NavGroupItem {
  type: 'group';
  key: string;
  label: string;
  icon?: string;
  children: NavItem[];
}

export type NavItem = NavPageItem | NavGroupItem;

export interface RouteEntry {
  path: string;
  page: PageDefinition;
}

// ── Selectors ────────────────────────────────────────────────────────────────

export function getManifestRoutes(manifest: CellManifestV1): RouteEntry[] {
  const pages = manifest.spec.pages ?? [];
  return pages.map((page) => ({
    path: page.path,
    page,
  }));
}

export function resolveLandingPath(manifest: CellManifestV1): string {
  const landingKey = manifest.spec.mount.landingPage;
  const pages = manifest.spec.pages ?? [];
  const landing = pages.find((p) => p.key === landingKey);
  return landing?.path ?? pages[0]?.path ?? '/';
}

export function getManifestNavigation(manifest: CellManifestV1): NavItem[] {
  const navDef = manifest.spec.navigation;
  if (!navDef?.items?.length) return [];

  const pages = manifest.spec.pages ?? [];
  const pageMap = new Map(pages.map((p) => [p.key, p]));

  function resolveItem(item: NavigationItem): NavItem | null {
    if (item.type === 'page') {
      const page = pageMap.get(item.pageKey);
      if (!page) return null;
      return {
        type: 'page',
        key: item.key,
        label: item.label ?? page.title,
        path: page.path,
        icon: item.icon,
      };
    }
    if (item.type === 'group') {
      const children = (item.children ?? [])
        .map(resolveItem)
        .filter((c): c is NavItem => c !== null);
      if (children.length === 0) return null;
      return {
        type: 'group',
        key: item.key,
        label: item.label,
        icon: item.icon,
        children,
      };
    }
    return null;
  }

  return navDef.items.map(resolveItem).filter((i): i is NavItem => i !== null);
}

export function findManifestEntity(
  manifest: CellManifestV1,
  entityKey: string,
): EntityDefinition | undefined {
  return (manifest.spec.entities ?? []).find((e) => e.key === entityKey);
}

export function resolveManifestEntity(
  manifest: CellManifestV1,
  entityKey: string,
): ResolvedEntity | null {
  const entity = findManifestEntity(manifest, entityKey);
  if (!entity) return null;

  const fields = entity.fields ?? [];

  const listFields = fields.filter(
    (f) => f.type !== 'object' && (f as any).list?.visible !== false,
  );

  const formFields = fields.filter(
    (f) => (f as any).form?.visible !== false,
  );

  let createFields: ResolvedCreateField[] = [];
  let editFields: ResolvedCreateField[] = [];
  try {
    createFields = deriveCreateFields(fields);
    editFields = deriveEditFields(fields);
  } catch {
    // graceful fallback — derive functions may fail on incomplete definitions
  }

  return {
    ...entity,
    listFields,
    formFields,
    createFields,
    editFields,
  };
}

export function resolveAllEntities(
  manifest: CellManifestV1,
): Map<string, ResolvedEntity> {
  const map = new Map<string, ResolvedEntity>();
  for (const entity of manifest.spec.entities ?? []) {
    const resolved = resolveManifestEntity(manifest, entity.key);
    if (resolved) map.set(entity.key, resolved);
  }
  return map;
}
