import { useState, useRef, useMemo } from 'react';
import type { AuditEvent, CellManifestV1, EntityVersion, FieldDiff } from '@ikary/cell-contract';
import { generateMockRows } from '../../providers/mock-data-provider';
import { resolveManifestEntities } from '../../manifest/selectors';
import type { CellDataStore } from '../cell-data-store';

type EntityDataMap = Record<string, Record<string, unknown>[]>;
type VersionMap = Record<string, Record<string, EntityVersion[]>>;
type AuditMap = Record<string, Record<string, AuditEvent[]>>;

interface StoreState {
  data: EntityDataMap;
  versions: VersionMap;
  audit: AuditMap;
}

function computeDiff(oldData: Record<string, unknown>, newData: Record<string, unknown>): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  for (const key of allKeys) {
    if (key.startsWith('_') || key === 'id') continue;
    const before = oldData[key];
    const after = newData[key];
    if (String(before) === String(after)) continue;
    if (before === undefined) {
      diffs.push({ fieldKey: key, fieldName: key, before: undefined, after, kind: 'added' });
    } else if (after === undefined) {
      diffs.push({ fieldKey: key, fieldName: key, before, after: undefined, kind: 'removed' });
    } else {
      diffs.push({ fieldKey: key, fieldName: key, before, after, kind: 'modified' });
    }
  }
  return diffs;
}

function withMeta(
  record: Record<string, unknown>,
  version: number,
  actor: string,
  isNew = false,
): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    ...record,
    _version: version,
    _updatedAt: now,
    _updatedBy: actor,
    ...(isNew ? { _createdAt: now, _createdBy: actor } : {}),
  };
}

function seedWithMeta(record: Record<string, unknown>, index: number): Record<string, unknown> {
  const base = new Date(Date.now() - index * 86400000 * 3);
  return {
    ...record,
    _version: 1,
    _createdAt: new Date(base.getTime() - 3600000).toISOString(),
    _createdBy: 'demo-user',
    _updatedAt: base.toISOString(),
    _updatedBy: 'demo-user',
  };
}

function seedData(manifest: CellManifestV1): EntityDataMap {
  const map: EntityDataMap = {};
  for (const entity of resolveManifestEntities(manifest)) {
    map[entity.key] = generateMockRows(entity, 5).map((r, i) => seedWithMeta(r, i));
  }
  return map;
}

function seedVersions(data: EntityDataMap): VersionMap {
  const map: VersionMap = {};
  for (const [entityKey, rows] of Object.entries(data)) {
    map[entityKey] = {};
    for (const row of rows) {
      const id = String(row['id']);
      map[entityKey][id] = [
        {
          version: 1,
          data: { ...row },
          updatedAt: String(row['_createdAt'] ?? new Date().toISOString()),
          updatedBy: String(row['_createdBy'] ?? 'demo-user'),
          diff: [],
        },
      ];
    }
  }
  return map;
}

function seedAudit(data: EntityDataMap): AuditMap {
  const map: AuditMap = {};
  for (const [entityKey, rows] of Object.entries(data)) {
    map[entityKey] = {};
    for (const row of rows) {
      const id = String(row['id']);
      map[entityKey][id] = [
        {
          id: `audit-seed-${entityKey}-${id}`,
          timestamp: String(row['_createdAt'] ?? new Date().toISOString()),
          actor: String(row['_createdBy'] ?? 'demo-user'),
          eventType: 'entity.created',
          entityKey,
          entityId: id,
          version: 1,
          description: `${entityKey} created`,
          diff: [],
        },
      ];
    }
  }
  return map;
}

let auditCounter = 0;

/**
 * Creates a reactive in-memory data store for a manifest.
 * Pre-seeded with generated rows per entity. Mutations trigger re-renders.
 * Tracks full version history and audit events.
 */
export function useCreateCellDataStore(manifest: CellManifestV1): CellDataStore {
  const [state, setState] = useState<StoreState>(() => {
    const data = seedData(manifest);
    return {
      data,
      versions: seedVersions(data),
      audit: seedAudit(data),
    };
  });
  const counterRef = useRef(1000);

  return useMemo<CellDataStore>(
    () => ({
      isListLoading: () => false,

      getRows: (entityKey) => state.data[entityKey] ?? [],

      getOne: (entityKey, id) => (state.data[entityKey] ?? []).find((r) => String(r['id']) === id),

      create(entityKey, record) {
        const id = String(++counterRef.current);
        const created = withMeta({ id, ...record }, 1, 'current-user', true);
        const now = new Date().toISOString();

        const firstVersion: EntityVersion = {
          version: 1,
          data: { ...created },
          updatedAt: now,
          updatedBy: 'current-user',
          diff: [],
        };
        const auditEvent: AuditEvent = {
          id: `audit-${++auditCounter}`,
          timestamp: now,
          actor: 'current-user',
          eventType: 'entity.created',
          entityKey,
          entityId: id,
          version: 1,
          description: `${entityKey} created`,
          diff: [],
        };

        setState((prev) => ({
          data: {
            ...prev.data,
            [entityKey]: [...(prev.data[entityKey] ?? []), created],
          },
          versions: {
            ...prev.versions,
            [entityKey]: {
              ...(prev.versions[entityKey] ?? {}),
              [id]: [firstVersion],
            },
          },
          audit: {
            ...prev.audit,
            [entityKey]: {
              ...(prev.audit[entityKey] ?? {}),
              [id]: [auditEvent],
            },
          },
        }));
        return created;
      },

      delete(entityKey, id, expectedVersion) {
        const rows = state.data[entityKey] ?? [];
        const existing = rows.find((r) => String(r['id']) === id);
        if (!existing) return false;

        const now = new Date().toISOString();
        const auditEvent: AuditEvent = {
          id: `audit-${++auditCounter}`,
          timestamp: now,
          actor: 'current-user',
          eventType: 'entity.deleted',
          entityKey,
          entityId: id,
          version: expectedVersion,
          description: `${entityKey} deleted`,
          diff: [],
        };

        setState((prev) => ({
          data: {
            ...prev.data,
            [entityKey]: (prev.data[entityKey] ?? []).filter((r) => String(r['id']) !== id),
          },
          versions: prev.versions,
          audit: {
            ...prev.audit,
            [entityKey]: {
              ...(prev.audit[entityKey] ?? {}),
              [id]: [...(prev.audit[entityKey]?.[id] ?? []), auditEvent],
            },
          },
        }));
        return true;
      },

      update(entityKey, id, patch) {
        const rows = state.data[entityKey] ?? [];
        const existing = rows.find((r) => String(r['id']) === id);
        if (!existing) return undefined;

        const prevVersion = Number(existing['_version'] ?? 1);
        const newVersion = prevVersion + 1;
        const updated = withMeta({ ...existing, ...patch, id }, newVersion, 'current-user');
        const diff = computeDiff(existing, updated);
        const now = new Date().toISOString();

        const versionEntry: EntityVersion = {
          version: newVersion,
          data: { ...updated },
          updatedAt: now,
          updatedBy: 'current-user',
          diff,
        };
        const auditEvent: AuditEvent = {
          id: `audit-${++auditCounter}`,
          timestamp: now,
          actor: 'current-user',
          eventType: 'entity.updated',
          entityKey,
          entityId: id,
          version: newVersion,
          description: `${entityKey} updated (${diff.length} field${diff.length !== 1 ? 's' : ''} changed)`,
          diff,
        };

        setState((prev) => ({
          data: {
            ...prev.data,
            [entityKey]: (prev.data[entityKey] ?? []).map((r) => (String(r['id']) === id ? updated : r)),
          },
          versions: {
            ...prev.versions,
            [entityKey]: {
              ...(prev.versions[entityKey] ?? {}),
              [id]: [...(prev.versions[entityKey]?.[id] ?? []), versionEntry],
            },
          },
          audit: {
            ...prev.audit,
            [entityKey]: {
              ...(prev.audit[entityKey] ?? {}),
              [id]: [...(prev.audit[entityKey]?.[id] ?? []), auditEvent],
            },
          },
        }));
        return updated;
      },

      rollback(entityKey, id, toVersion) {
        const entityVersions = state.versions[entityKey]?.[id] ?? [];
        const target = entityVersions.find((v) => v.version === toVersion);
        if (!target) return undefined;

        const rows = state.data[entityKey] ?? [];
        const existing = rows.find((r) => String(r['id']) === id);
        if (!existing) return undefined;

        const prevVersion = Number(existing['_version'] ?? 1);
        const newVersion = prevVersion + 1;
        const now = new Date().toISOString();
        const rolledBack = withMeta({ ...target.data, id }, newVersion, 'current-user');
        const diff = computeDiff(existing, rolledBack);

        const versionEntry: EntityVersion = {
          version: newVersion,
          data: { ...rolledBack },
          updatedAt: now,
          updatedBy: 'current-user',
          diff,
        };
        const auditEvent: AuditEvent = {
          id: `audit-${++auditCounter}`,
          timestamp: now,
          actor: 'current-user',
          eventType: 'entity.rollback',
          entityKey,
          entityId: id,
          version: newVersion,
          description: `Rolled back to v${toVersion} → new v${newVersion}`,
          diff,
        };

        setState((prev) => ({
          data: {
            ...prev.data,
            [entityKey]: (prev.data[entityKey] ?? []).map((r) => (String(r['id']) === id ? rolledBack : r)),
          },
          versions: {
            ...prev.versions,
            [entityKey]: {
              ...(prev.versions[entityKey] ?? {}),
              [id]: [...(prev.versions[entityKey]?.[id] ?? []), versionEntry],
            },
          },
          audit: {
            ...prev.audit,
            [entityKey]: {
              ...(prev.audit[entityKey] ?? {}),
              [id]: [...(prev.audit[entityKey]?.[id] ?? []), auditEvent],
            },
          },
        }));
        return rolledBack;
      },

      getVersions: (entityKey, id) => [...(state.versions[entityKey]?.[id] ?? [])].reverse(),

      getAuditEvents: (entityKey, id) => [...(state.audit[entityKey]?.[id] ?? [])].reverse(),
    }),
    [state],
  );
}
