import type { UIPrimitiveDefinition, RegisterablePrimitive, PrimitiveComponent } from '../types/PrimitiveTypes';
import { resolveVersion } from '@ikary/cell-primitive-contract';

// Internal: name → version → definition
const versionedRegistry = new Map<string, Map<string, UIPrimitiveDefinition<any, any, any>>>();

// Latest pointer per primitive name. Set by registerPrimitive() or overridden by registerPrimitiveVersion().
const latestPointers = new Map<string, string>();

export function registerPrimitive<ContractProps = unknown, ResolvedProps = unknown, Context = unknown>(
  name: string,
  primitive: RegisterablePrimitive<ContractProps, ResolvedProps, Context>,
  options?: { isController?: boolean; source?: 'core' | 'custom'; label?: string; category?: string },
): void {
  const { component, resolver, meta } = normalizeRegisterablePrimitive(primitive);
  const definition: UIPrimitiveDefinition<ContractProps, ResolvedProps, Context> = {
    name,
    component: component as PrimitiveComponent,
    resolver: resolver as UIPrimitiveDefinition<any, any, any>['resolver'],
    isController: options?.isController,
    source: options?.source ?? meta.source ?? 'core',
    label: options?.label ?? meta.label,
    category: options?.category ?? meta.category,
  };

  _storeDefinition(name, 'latest', definition);
  latestPointers.set(name, 'latest');
}

export function registerPrimitiveVersion<
  ContractProps = unknown,
  ResolvedProps = unknown,
  Context = unknown,
>(
  name: string,
  version: string,
  primitive: RegisterablePrimitive<ContractProps, ResolvedProps, Context>,
  options?: { isController?: boolean; source?: 'core' | 'custom'; setLatest?: boolean; label?: string; category?: string },
): void {
  const { component, resolver, meta } = normalizeRegisterablePrimitive(primitive);
  const definition: UIPrimitiveDefinition<ContractProps, ResolvedProps, Context> = {
    name,
    component: component as PrimitiveComponent,
    resolver: resolver as UIPrimitiveDefinition<any, any, any>['resolver'],
    isController: options?.isController,
    version,
    source: options?.source ?? meta.source ?? 'core',
    label: options?.label ?? meta.label,
    category: options?.category ?? meta.category,
  };

  _storeDefinition(name, version, definition);

  // Update latest pointer if requested (default true for new registrations)
  const shouldSetLatest = options?.setLatest ?? true;
  if (shouldSetLatest) {
    latestPointers.set(name, version);
    // Mirror to the 'latest' slot so callers using 'latest' get the right component
    _storeDefinition(name, 'latest', { ...definition, version: 'latest' });
  }
}

/**
 * Override the 'latest' pointer for a core primitive to point to a custom version.
 * Called by custom register files that declare `overrides: <coreKey>` in ikary-primitives.yaml.
 */
export function setLatestPrimitive(name: string, version: string): void {
  const versions = versionedRegistry.get(name);
  const def = versions?.get(version);
  if (!def) {
    throw new Error(
      `Cannot set latest for '${name}@${version}': version not registered. Call registerPrimitiveVersion first.`,
    );
  }
  latestPointers.set(name, version);
  _storeDefinition(name, 'latest', { ...def, version: 'latest' });
}

export function getPrimitive(
  name: string,
  version?: string,
): UIPrimitiveDefinition<any, any, any> | undefined {
  const versions = versionedRegistry.get(name);
  if (!versions) return undefined;

  const requested = version ?? 'latest';

  // Exact match first (includes 'latest')
  if (versions.has(requested)) return versions.get(requested);

  // Semver range resolution against registered concrete versions
  const concreteVersions = Array.from(versions.keys()).filter((v) => v !== 'latest');
  const resolved = resolveVersion(concreteVersions, requested);
  if (resolved) return versions.get(resolved);

  return undefined;
}

export function listPrimitives(): UIPrimitiveDefinition<any, any, any>[] {
  return Array.from(versionedRegistry.entries())
    .map(([, versions]) => versions.get('latest'))
    .filter((def): def is UIPrimitiveDefinition<any, any, any> => def !== undefined);
}

export function listPrimitiveVersions(name: string): string[] {
  const versions = versionedRegistry.get(name);
  if (!versions) return [];
  return Array.from(versions.keys()).filter((v) => v !== 'latest');
}

export function listAllPrimitiveVersions(): Array<{ name: string; version: string }> {
  const result: Array<{ name: string; version: string }> = [];
  for (const [name, versions] of versionedRegistry.entries()) {
    for (const version of versions.keys()) {
      if (version !== 'latest') {
        result.push({ name, version });
      }
    }
  }
  return result;
}

function _storeDefinition(
  name: string,
  version: string,
  definition: UIPrimitiveDefinition<any, any, any>,
): void {
  if (!versionedRegistry.has(name)) {
    versionedRegistry.set(name, new Map());
  }
  versionedRegistry.get(name)!.set(version, definition);
}

function normalizeRegisterablePrimitive<ContractProps = unknown, ResolvedProps = unknown, Context = unknown>(
  primitive: RegisterablePrimitive<ContractProps, ResolvedProps, Context>,
): {
  component: PrimitiveComponent<ResolvedProps>;
  resolver?: UIPrimitiveDefinition<ContractProps, ResolvedProps, Context>['resolver'];
  /** Metadata fields passed directly on the primitive object (backwards-compat with old scaffold format). */
  meta: { source?: 'core' | 'custom'; label?: string; category?: string };
} {
  if (typeof primitive === 'function') {
    return { component: primitive as PrimitiveComponent<ResolvedProps>, meta: {} };
  }

  // Cast to any to read extra fields that old scaffold templates placed on the primitive object
  // instead of the options argument. Options always take precedence over these.
  const p = primitive as any;
  return {
    component: primitive.component,
    resolver: primitive.resolver,
    meta: {
      source: p.source,
      label: p.label,
      category: p.category,
    },
  };
}
