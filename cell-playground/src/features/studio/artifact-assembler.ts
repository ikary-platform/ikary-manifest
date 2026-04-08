import type { CellManifestV1, NavigationItem, PageDefinition } from '@ikary/cell-contract-core';
import type { ReplacementArtifacts, StudioCurrentArtifactSet, StudioLayoutDefinition } from './contracts';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

function buildPagesFromLayouts(layouts: StudioLayoutDefinition[]): PageDefinition[] {
  return layouts.map((layout) => ({
    key: layout.key,
    type: layout.type,
    title: layout.title,
    path: normalizePath(layout.path),
    entity: layout.entity,
  }));
}

function buildNavigationFromLayouts(layouts: StudioLayoutDefinition[]): NavigationItem[] {
  return [
    {
      type: 'group',
      key: 'main',
      label: 'Main',
      order: 0,
      children: layouts.map((layout, index) => ({
        type: 'page',
        key: `nav-${layout.key}`,
        pageKey: layout.key,
        label: layout.title,
        order: index,
      })),
    },
  ];
}

function deriveCellKey(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'generated-cell'
  );
}

function ensureMountSpec(manifest: CellManifestV1): CellManifestV1['spec']['mount'] {
  const fallbackName = asNonEmptyString(manifest.metadata.name) ?? 'Generated Cell';
  const fallbackKey = deriveCellKey(asNonEmptyString(manifest.metadata.key) ?? fallbackName);

  const existingMount = asRecord(asRecord(manifest.spec)?.mount) ?? {};

  const normalizedMount: CellManifestV1['spec']['mount'] = {
    title: asNonEmptyString(existingMount.title) ?? fallbackName,
    mountPath: normalizePath(asNonEmptyString(existingMount.mountPath) ?? `/${fallbackKey}`),
    landingPage: asNonEmptyString(existingMount.landingPage) ?? `${fallbackKey}-landing`,
  };

  manifest.spec = {
    ...manifest.spec,
    mount: normalizedMount,
  };

  return normalizedMount;
}

function normalizeManifest(manifest: CellManifestV1, current: StudioCurrentArtifactSet): CellManifestV1 {
  const source = manifest as unknown;
  const root = asRecord(source) ?? {};
  const metadata = asRecord(root.metadata) ?? {};
  const spec = asRecord(root.spec) ?? {};
  const mount = asRecord(spec.mount) ?? {};

  const fallbackName =
    asNonEmptyString(metadata.name) ??
    current.discovery?.cell_name ??
    current.plan?.proposed_cell_name ??
    'Generated Cell';

  const fallbackKey = deriveCellKey(asNonEmptyString(metadata.key) ?? fallbackName);

  return {
    apiVersion: 'ikary.io/v1alpha1',
    kind: 'Cell',
    metadata: {
      key: asNonEmptyString(metadata.key) ?? fallbackKey,
      name: asNonEmptyString(metadata.name) ?? fallbackName,
      version: asNonEmptyString(metadata.version) ?? '1.0.0',
      description: asNonEmptyString(metadata.description) ?? undefined,
    },
    spec: {
      mount: {
        title: asNonEmptyString(mount.title) ?? fallbackName,
        mountPath: normalizePath(asNonEmptyString(mount.mountPath) ?? `/${fallbackKey}`),
        landingPage: asNonEmptyString(mount.landingPage) ?? `${fallbackKey}-landing`,
      },
      appShell: spec.appShell as CellManifestV1['spec']['appShell'],
      entities: Array.isArray(spec.entities) ? (spec.entities as CellManifestV1['spec']['entities']) : undefined,
      pages: Array.isArray(spec.pages) ? (spec.pages as CellManifestV1['spec']['pages']) : undefined,
      navigation: asRecord(spec.navigation) ? (spec.navigation as CellManifestV1['spec']['navigation']) : undefined,
      roles: Array.isArray(spec.roles) ? (spec.roles as CellManifestV1['spec']['roles']) : undefined,
    },
  };
}

export function applyReplacementArtifacts(
  current: StudioCurrentArtifactSet,
  replacement: ReplacementArtifacts,
): StudioCurrentArtifactSet {
  return {
    ...current,
    ...(replacement.cell_manifest ? { manifest: clone(replacement.cell_manifest) } : {}),
    ...(replacement.entity_schemas ? { entity_schema: clone(replacement.entity_schemas) } : {}),
    ...(replacement.layouts ? { layout: clone(replacement.layouts) } : {}),
    ...(replacement.actions ? { action: clone(replacement.actions) } : {}),
    ...(replacement.permissions ? { permission: clone(replacement.permissions) } : {}),
  };
}

export function assembleManifest(current: StudioCurrentArtifactSet): CellManifestV1 | null {
  const manifest = current.manifest ? normalizeManifest(clone(current.manifest), current) : null;

  if (manifest) {
    const mount = ensureMountSpec(manifest);

    if (current.entity_schema && current.entity_schema.length > 0) {
      manifest.spec.entities = clone(current.entity_schema);
    }

    if (current.layout && current.layout.length > 0) {
      const pages = buildPagesFromLayouts(current.layout);
      manifest.spec.pages = pages;
      manifest.spec.navigation = { items: buildNavigationFromLayouts(current.layout) };
      mount.landingPage = pages[0]?.key ?? mount.landingPage;
      manifest.spec.mount = mount;
    }

    return manifest;
  }

  if (!current.entity_schema || current.entity_schema.length === 0) {
    return null;
  }

  const discoveryName = current.discovery?.cell_name ?? current.plan?.proposed_cell_name ?? 'Generated Cell';
  const cellKey = deriveCellKey(discoveryName);

  const layouts: StudioLayoutDefinition[] =
    current.layout && current.layout.length > 0
      ? current.layout
      : [
          {
            key: `${current.entity_schema[0]!.key}-list`,
            type: 'entity-list',
            title: current.entity_schema[0]!.pluralName,
            path: `/${current.entity_schema[0]!.key}`,
            entity: current.entity_schema[0]!.key,
          },
        ];

  const pages = buildPagesFromLayouts(layouts);

  return {
    apiVersion: 'ikary.io/v1alpha1',
    kind: 'Cell',
    metadata: {
      key: cellKey,
      name: discoveryName,
      version: '1.0.0',
      description: current.discovery?.summary,
    },
    spec: {
      mount: {
        title: discoveryName,
        mountPath: `/${cellKey}`,
        landingPage: pages[0]?.key ?? `${cellKey}-landing`,
      },
      entities: clone(current.entity_schema),
      pages,
      navigation: {
        items: buildNavigationFromLayouts(layouts),
      },
      roles: [],
    },
  };
}
