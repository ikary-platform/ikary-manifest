import type { UIPrimitiveDefinition, RegisterablePrimitive, PrimitiveComponent } from '../types/PrimitiveTypes';
import { resolveVersion } from '@ikary/primitive-contract';

// Internal: name → version → definition
const versionedRegistry = new Map<string, Map<string, UIPrimitiveDefinition<any, any, any>>>();

// Latest pointer per primitive name. Set by registerPrimitive() or overridden by registerPrimitiveVersion().
const latestPointers = new Map<string, string>();

export function registerPrimitive<ContractProps = unknown, ResolvedProps = unknown, Context = unknown>(
  name: string,
  primitive: RegisterablePrimitive<ContractProps, ResolvedProps, Context>,
  options?: { isController?: boolean; source?: 'core' | 'custom' },
): void {
  const normalized = normalizeRegisterablePrimitive(primitive);
  const definition: UIPrimitiveDefinition<ContractProps, ResolvedProps, Context> = {
    name,
    component: normalized.component as PrimitiveComponent,
    resolver: normalized.resolver as UIPrimitiveDefinition<any, any, any>['resolver'],
    isController: options?.isController,
    source: options?.source ?? 'core',
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
  options?: { isController?: boolean; source?: 'core' | 'custom'; setLatest?: boolean },
): void {
  const normalized = normalizeRegisterablePrimitive(primitive);
  const definition: UIPrimitiveDefinition<ContractProps, ResolvedProps, Context> = {
    name,
    component: normalized.component as PrimitiveComponent,
    resolver: normalized.resolver as UIPrimitiveDefinition<any, any, any>['resolver'],
    isController: options?.isController,
    version,
    source: options?.source ?? 'core',
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
} {
  if (typeof primitive === 'function') {
    return { component: primitive as PrimitiveComponent<ResolvedProps> };
  }

  return {
    component: primitive.component,
    resolver: primitive.resolver,
  };
}
