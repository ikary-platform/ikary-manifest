import { useState, useMemo, useEffect, startTransition } from 'react';
import type { CellManifestV1, AuditEvent, EntityVersion, FieldDiff } from '@ikary/contract';
import type { CellDataStore } from '../cell-data-store';
import type { EntityApiAdapter, AuditLogEntry } from '../entity-api-adapter';

export interface ApiDataStoreConfig {
  tenantId: string;
  workspaceId: string;
}

const SYSTEM_DIFF_FIELDS = new Set([
  'id',
  'version',
  'created_at',
  'updated_at',
  'deleted_at',
  'tenant_id',
  'workspace_id',
  'cell_id',
  'created_by',
  'updated_by',
  'deleted_by',
]);

/**
 * Normalizes audit diff entries from either the new FieldDiff format
 * (fieldKey/kind) or the legacy DiffEntry format (op/path).
 */
function normalizeDiff(raw: unknown): FieldDiff[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw.flatMap((d: unknown): FieldDiff[] => {
    if (!d || typeof d !== 'object') return [];
    const obj = d as Record<string, unknown>;

    // New format: fieldKey + kind already present
    if (typeof obj['fieldKey'] === 'string' && typeof obj['kind'] === 'string') {
      return [obj as unknown as FieldDiff];
    }

    // Legacy DiffEntry format: op + path — transform
    const path = String(obj['path'] ?? '');
    const fieldKey = (path.startsWith('/') ? path.slice(1) : path).split('/')[0];
    if (!fieldKey || SYSTEM_DIFF_FIELDS.has(fieldKey) || seen.has(fieldKey)) return [];
    seen.add(fieldKey);
    const op = String(obj['op'] ?? '');
    const kind: FieldDiff['kind'] = op === 'add' ? 'added' : op === 'remove' ? 'removed' : 'modified';
    return [
      {
        fieldKey,
        fieldName: fieldKey,
        before: obj['before'],
        after: obj['after'],
        kind,
      },
    ];
  });
}

/**
 * Maps an AuditLogEntry (from the API) to the CellDataStore's AuditEvent shape.
 */
function mapAuditEntry(entry: AuditLogEntry, entityKey: string, entityId: string): AuditEvent {
  return {
    id: entry.id,
    timestamp: entry.occurredAt,
    actor: entry.actorEmail ?? entry.actorId ?? entry.actorType,
    eventType: entry.eventType as AuditEvent['eventType'],
    entityKey,
    entityId,
    version: entry.resourceVersion,
    description: `${entry.changeKind} (v${entry.resourceVersion})`,
    diff: normalizeDiff(entry.diff),
  };
}

/**
 * Maps an AuditLogEntry to an EntityVersion shape.
 */
function mapAuditToVersion(entry: AuditLogEntry): EntityVersion {
  return {
    version: entry.resourceVersion,
    data: (entry.snapshot as Record<string, unknown>) ?? {},
    updatedAt: entry.occurredAt,
    updatedBy: entry.actorEmail ?? entry.actorId ?? entry.actorType,
    diff: normalizeDiff(entry.diff),
  };
}

/**
 * Creates a CellDataStore backed by an EntityApiAdapter.
 *
 * The adapter is expected to be already initialised for the default/active
 * entity.  When getRows / getOne are called for a different entity, this store
 * notifies the adapter via setActiveEntity / setActiveRecord so it can
 * re-initialise its queries.
 *
 * Pass an adapter implementation that wraps @ikary/cell-runtime-api/ui hooks
 * (see useEntityBridgeAdapter in ikary-cell-ui) or any other fetch strategy.
 */
export function useCreateApiDataStore(manifest: CellManifestV1, adapter: EntityApiAdapter): CellDataStore {
  // Track which entity + record are "active" for detail/audit queries
  const [activeEntity, setActiveEntity] = useState<string | null>(null);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  // Track requested entity/record — useEffect syncs these to active state
  const [requestedEntity, setRequestedEntity] = useState<string | null>(null);
  const [requestedRecordId, setRequestedRecordId] = useState<string | null>(null);

  // Sync the initial effectiveEntity to the adapter on mount.
  // Without this, the first entity in the manifest never triggers
  // adapter.setActiveEntity because getRows() matches effectiveEntity
  // directly and never sets requestedEntity.
  const entities = manifest.spec.entities ?? [];
  const initialEntityKey = entities[0]?.key ?? '';

  useEffect(() => {
    if (initialEntityKey && activeEntity === null) {
      adapter.setActiveEntity(initialEntityKey);
    }
  }, [initialEntityKey, activeEntity, adapter]);

  // Sync requested → active via useEffect (avoids setState-during-render)
  useEffect(() => {
    if (requestedEntity !== null && requestedEntity !== activeEntity) {
      setActiveEntity(requestedEntity);
      adapter.setActiveEntity(requestedEntity);
    }
  }, [requestedEntity, activeEntity, adapter]);

  useEffect(() => {
    if (requestedRecordId !== null && requestedRecordId !== activeRecordId) {
      setActiveRecordId(requestedRecordId);
      if (requestedEntity) {
        adapter.setActiveRecord(requestedEntity, requestedRecordId);
      }
    }
  }, [requestedRecordId, activeRecordId, requestedEntity, adapter]);

  const effectiveEntity = activeEntity ?? initialEntityKey;

  return useMemo<CellDataStore>(() => {
    return {
      isListLoading(entityKey: string): boolean {
        if (entityKey === effectiveEntity) {
          return adapter.listLoading;
        }
        return true;
      },

      getRows(entityKey: string): Record<string, unknown>[] {
        if (entityKey === effectiveEntity) {
          return (adapter.listData.data as Record<string, unknown>[]) ?? [];
        }
        if (entityKey !== requestedEntity) {
          startTransition(() => setRequestedEntity(entityKey));
        }
        return [];
      },

      getOne(entityKey: string, id: string): Record<string, unknown> | undefined {
        if (entityKey !== requestedEntity || id !== requestedRecordId) {
          startTransition(() => {
            setRequestedEntity(entityKey);
            setRequestedRecordId(id);
          });
        }

        if (entityKey === effectiveEntity && id === activeRecordId && adapter.detailData) {
          return adapter.detailData.data as Record<string, unknown>;
        }

        // Fallback: check list data
        if (entityKey === effectiveEntity && adapter.listData.data) {
          const row = (adapter.listData.data as Record<string, unknown>[]).find((r) => String(r['id']) === id);
          if (row) return row;
        }

        return undefined;
      },

      async create(entityKey: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
        const result = await adapter.createAsync(data);
        return result.data as Record<string, unknown>;
      },

      async update(
        entityKey: string,
        id: string,
        patch: Record<string, unknown>,
      ): Promise<Record<string, unknown> | undefined> {
        const version = Number(patch['_version'] ?? patch['expectedVersion'] ?? 1);
        const result = await adapter.updateAsync({
          id,
          data: patch,
          expectedVersion: version,
        });
        return result?.data as Record<string, unknown> | undefined;
      },

      async delete(entityKey: string, id: string, _expectedVersion: number): Promise<boolean> {
        await adapter.deleteAsync(id);
        return true;
      },

      rollback(entityKey: string, id: string, toVersion: number): Record<string, unknown> | undefined {
        void adapter.rollbackAsync({ id, targetVersion: toVersion });
        return undefined;
      },

      getVersions(entityKey: string, id: string): EntityVersion[] {
        if (entityKey !== requestedEntity || id !== requestedRecordId) {
          startTransition(() => {
            setRequestedEntity(entityKey);
            setRequestedRecordId(id);
          });
          return [];
        }

        if (!adapter.auditData?.data) return [];
        return adapter.auditData.data.map(mapAuditToVersion).sort((a, b) => b.version - a.version);
      },

      getAuditEvents(entityKey: string, id: string): AuditEvent[] {
        if (entityKey !== requestedEntity || id !== requestedRecordId) {
          startTransition(() => {
            setRequestedEntity(entityKey);
            setRequestedRecordId(id);
          });
          return [];
        }

        if (!adapter.auditData?.data) return [];
        return adapter.auditData.data
          .map((e) => mapAuditEntry(e, entityKey, id))
          .sort((a, b) => b.version - a.version);
      },
    };
  }, [
    manifest,
    effectiveEntity,
    activeEntity,
    activeRecordId,
    requestedEntity,
    requestedRecordId,
    adapter,
  ]);
}
