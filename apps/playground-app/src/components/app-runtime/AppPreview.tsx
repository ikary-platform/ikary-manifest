import { useMemo, useState, useEffect, useCallback } from 'react';
import type { CellManifestV1 } from '@ikary/contract';
import { MockEntityStore } from '../api-explorer/MockEntityStore';
import { AppRuntimeProvider } from './AppRuntimeContext';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppShell } from './AppShell';
import { resolveAllEntities, resolveLandingPath } from './manifest-helpers';

interface AppPreviewProps {
  json: string;
}

interface ParsedManifest {
  manifest: CellManifestV1;
  errors: null;
}

interface ParseError {
  manifest: null;
  errors: string[];
}

function parseManifestJson(json: string): ParsedManifest | ParseError {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { manifest: null, errors: [`JSON parse error: ${(e as Error).message}`] };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { manifest: null, errors: ['JSON must be an object.'] };
  }

  const obj = parsed as Record<string, unknown>;
  const errs: string[] = [];

  if (obj.apiVersion !== 'ikary.co/v1alpha1') {
    errs.push(`Expected apiVersion "ikary.co/v1alpha1", got "${String(obj.apiVersion ?? 'undefined')}".`);
  }
  if (obj.kind !== 'Cell') {
    errs.push(`Expected kind "Cell", got "${String(obj.kind ?? 'undefined')}".`);
  }
  if (!obj.spec || typeof obj.spec !== 'object') {
    errs.push('Missing "spec" object.');
  }

  if (errs.length > 0) {
    return { manifest: null, errors: errs };
  }

  return { manifest: parsed as CellManifestV1, errors: null };
}

export function AppPreview({ json }: AppPreviewProps) {
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  const result = useMemo(() => parseManifestJson(json), [json]);

  useEffect(() => {
    setErrorBoundaryKey((k) => k + 1);
  }, [json]);

  if (result.errors) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Invalid manifest</h3>
          {result.errors.map((err, i) => (
            <p key={i} className="text-xs text-gray-500 dark:text-gray-400">{err}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AppErrorBoundary key={errorBoundaryKey} onReset={() => setErrorBoundaryKey((k) => k + 1)}>
      <AppPreviewInner manifest={result.manifest} />
    </AppErrorBoundary>
  );
}

function AppPreviewInner({ manifest }: { manifest: CellManifestV1 }) {
  const landingPath = resolveLandingPath(manifest);
  const [currentPath, setCurrentPath] = useState(landingPath);

  // Reset to landing when manifest changes
  useEffect(() => {
    setCurrentPath(resolveLandingPath(manifest));
  }, [manifest]);

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  // Stores and entities depend only on manifest — not on currentPath
  const { stores, entities } = useMemo(() => {
    const entities = resolveAllEntities(manifest);
    const stores = new Map<string, MockEntityStore>();

    for (const entity of manifest.spec.entities ?? []) {
      const store = new MockEntityStore(entity);
      store.seed(10);
      stores.set(entity.key, store);
    }

    return { stores, entities };
  }, [manifest]);

  const ctx = useMemo(
    () => ({ manifest, stores, entities, currentPath, navigate }),
    [manifest, stores, entities, currentPath, navigate],
  );

  return (
    <AppRuntimeProvider value={ctx}>
      <AppShell />
    </AppRuntimeProvider>
  );
}
