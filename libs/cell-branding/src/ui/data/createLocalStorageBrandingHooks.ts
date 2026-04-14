import { useSyncExternalStore } from 'react';
import type { BrandingDataHooks } from '../hooks/branding-data-hooks.js';
import type {
  PatchCellBrandingInput,
  ResetCellBrandingInput,
} from '../../shared/cell-branding.requests.js';
import { cellBrandingSchema, type CellBranding } from '../../shared/cell-branding.schema.js';
import { isBrandingCustomized } from '../../shared/cell-branding.defaults.js';

export interface LocalStorageBrandingHooksOptions {
  storageKey?: string;
}

type Listener = () => void;

const NAMESPACE = 'ikary.cell-branding';

function keyFor(storageKey: string, cellId: string): string {
  return `${storageKey}.${cellId}`;
}

// Cache parsed records so useSyncExternalStore's getSnapshot returns a stable
// reference across renders. Without this, JSON.parse(...) returns a fresh
// object every call and React tears the component down with an infinite loop.
interface Cached {
  raw: string | null;
  parsed: CellBranding | null;
}
const snapshotCache = new Map<string, Cached>();

function readRecord(fullKey: string): CellBranding | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(fullKey);
  const cached = snapshotCache.get(fullKey);
  if (cached && cached.raw === raw) return cached.parsed;

  let parsed: CellBranding | null = null;
  if (raw) {
    try {
      parsed = cellBrandingSchema.parse(JSON.parse(raw));
    } catch {
      window.localStorage.removeItem(fullKey);
      snapshotCache.set(fullKey, { raw: null, parsed: null });
      return null;
    }
  }
  snapshotCache.set(fullKey, { raw, parsed });
  return parsed;
}

function writeRecord(fullKey: string, record: CellBranding): void {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(record);
  window.localStorage.setItem(fullKey, raw);
  snapshotCache.set(fullKey, { raw, parsed: record });
}

function buildInitial(cellId: string): CellBranding {
  const now = new Date().toISOString();
  return {
    cellId,
    version: 0,
    accentColor: null,
    titleFontFamily: null,
    bodyFontFamily: null,
    defaultThemeMode: null,
    isCustomized: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function createLocalStorageBrandingHooks(
  options: LocalStorageBrandingHooksOptions = {},
): BrandingDataHooks {
  const storageKey = options.storageKey ?? NAMESPACE;
  const listenersByCell = new Map<string, Set<Listener>>();

  function subscribe(fullKey: string, listener: Listener): () => void {
    let listeners = listenersByCell.get(fullKey);
    if (!listeners) {
      listeners = new Set();
      listenersByCell.set(fullKey, listeners);
    }
    listeners.add(listener);
    return () => {
      listeners?.delete(listener);
    };
  }

  function notify(fullKey: string): void {
    listenersByCell.get(fullKey)?.forEach((l) => l());
  }

  function apply(
    cellId: string,
    mutate: (current: CellBranding) => CellBranding,
  ): CellBranding {
    const fullKey = keyFor(storageKey, cellId);
    const current = readRecord(fullKey) ?? buildInitial(cellId);
    const next = mutate(current);
    writeRecord(fullKey, next);
    notify(fullKey);
    return next;
  }

  return {
    useBranding(cellId) {
      const fullKey = keyFor(storageKey, cellId);
      const snapshot = useSyncExternalStore(
        (cb) => subscribe(fullKey, cb),
        () => readRecord(fullKey),
        () => null,
      );
      return [snapshot, false, null] as const;
    },
    useUpdateBranding() {
      return async (cellId: string, input: PatchCellBrandingInput): Promise<CellBranding> => {
        return apply(cellId, (current) => {
          if (input.expectedVersion !== current.version) {
            throw new Error(
              `Branding version conflict: expected ${input.expectedVersion}, got ${current.version}`,
            );
          }
          const next: CellBranding = {
            ...current,
            accentColor: input.accentColor === undefined ? current.accentColor : input.accentColor,
            titleFontFamily:
              input.titleFontFamily === undefined ? current.titleFontFamily : input.titleFontFamily,
            bodyFontFamily:
              input.bodyFontFamily === undefined ? current.bodyFontFamily : input.bodyFontFamily,
            defaultThemeMode:
              input.defaultThemeMode === undefined ? current.defaultThemeMode : input.defaultThemeMode,
            version: current.version + 1,
            updatedAt: new Date().toISOString(),
          };
          next.isCustomized = isBrandingCustomized(next);
          return next;
        });
      };
    },
    useResetBranding() {
      return async (cellId: string, input: ResetCellBrandingInput): Promise<CellBranding> => {
        return apply(cellId, (current) => {
          if (input.expectedVersion !== current.version) {
            throw new Error(
              `Branding version conflict: expected ${input.expectedVersion}, got ${current.version}`,
            );
          }
          return {
            ...current,
            accentColor: null,
            titleFontFamily: null,
            bodyFontFamily: null,
            defaultThemeMode: null,
            isCustomized: false,
            version: current.version + 1,
            updatedAt: new Date().toISOString(),
          };
        });
      };
    },
    brandingQueryKeys: {
      detail: (cellId: string) => ['cell-branding', 'local', cellId],
    },
  };
}
