import { useState, useCallback, useMemo } from 'react';
import type {
  EntityApiAdapter,
  EntityListResponse,
  EntityItemResponse,
  AuditLogPage,
} from '@ikary/renderer';
import type { EntityRouteParams } from '@ikary/contract';
import {
  useCellEntityList,
  useCellEntityGetOne,
  useCellEntityCreate,
  useCellEntityUpdate,
  useCellEntityDelete,
  useCellEntityRollback,
  useCellEntityAuditLog,
  type AuditLogEntry,
} from '@ikary/data';

const EMPTY_LIST: EntityListResponse = { data: [], total: 0 };

/**
 * Implements `EntityApiAdapter` using the React Query hooks from `@ikary/data`.
 *
 * Replaces the deprecated `useLocalEntityAdapter` (plain fetch+useState) with
 * proper cache invalidation, correlation IDs, and query key scoping.
 *
 * Requires a surrounding `<CellApiProvider>` in the tree.
 */
export function useRQEntityAdapter(cellKey: string): EntityApiAdapter {
  const [activeEntityKey, setActiveEntityKey] = useState('');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  // Build route params with local-mode placeholders
  const routeParams: EntityRouteParams = useMemo(
    () => ({
      tenantId: 'local',
      workspaceId: 'local',
      cellKey,
      entityKey: activeEntityKey,
    }),
    [cellKey, activeEntityKey],
  );

  // ── Read hooks ─────────────────────────────────────────────────────────────

  const [listResponse, listLoading] = useCellEntityList(routeParams, {});
  const [detailResponse] = useCellEntityGetOne(routeParams, activeRecordId);

  const auditQuery = useCellEntityAuditLog(routeParams, activeRecordId);
  const auditData: AuditLogPage | undefined = useMemo(() => {
    if (!auditQuery.data) return undefined;
    return {
      data: auditQuery.data.data.map((e: AuditLogEntry) => ({
        id: String(e.id),
        eventType: e.eventType,
        resourceVersion: e.resourceVersion,
        actorId: e.actorId,
        actorType: e.actorType,
        actorEmail: e.actorEmail,
        changeKind: e.changeKind,
        snapshot: typeof e.snapshot === 'string' ? JSON.parse(e.snapshot) : e.snapshot,
        diff: typeof e.diff === 'string' ? JSON.parse(e.diff) : e.diff,
        occurredAt: e.occurredAt,
        requestId: e.requestId,
      })),
      total: auditQuery.data.total,
    };
  }, [auditQuery.data]);

  // ── Mutation hooks ─────────────────────────────────────────────────────────

  const [createAsync] = useCellEntityCreate(routeParams);
  const [updateAsync] = useCellEntityUpdate(routeParams);
  const [deleteAsync] = useCellEntityDelete(routeParams);
  const rollbackMutation = useCellEntityRollback(routeParams);

  // ── Adapter implementation ─────────────────────────────────────────────────

  const listData: EntityListResponse = useMemo(
    () => (activeEntityKey ? (listResponse as EntityListResponse) : EMPTY_LIST),
    [activeEntityKey, listResponse],
  );

  const detailData: EntityItemResponse | null = useMemo(
    () => (detailResponse ? (detailResponse as EntityItemResponse) : null),
    [detailResponse],
  );

  const handleCreate = useCallback(
    async (data: Record<string, unknown>) => {
      const result = await createAsync(data);
      return result as EntityItemResponse;
    },
    [createAsync],
  );

  const handleUpdate = useCallback(
    async ({ id, data, expectedVersion }: { id: string; data: Record<string, unknown>; expectedVersion?: number }) => {
      const result = await updateAsync({ id, data, expectedVersion });
      return result as EntityItemResponse | undefined;
    },
    [updateAsync],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteAsync(id);
    },
    [deleteAsync],
  );

  const handleRollback = useCallback(
    async ({ id, targetVersion, expectedVersion }: { id: string; targetVersion: number; expectedVersion?: number }) => {
      return rollbackMutation.mutateAsync({ id, targetVersion, expectedVersion });
    },
    [rollbackMutation],
  );

  const setActiveEntity = useCallback((entityKey: string) => {
    setActiveEntityKey(entityKey);
    setActiveRecordId(null);
  }, []);

  const setActiveRecord = useCallback((entityKey: string, id: string) => {
    setActiveEntityKey(entityKey);
    setActiveRecordId(id);
  }, []);

  return {
    listData,
    listLoading,
    detailData,
    auditData,
    createAsync: handleCreate,
    updateAsync: handleUpdate,
    deleteAsync: handleDelete,
    rollbackAsync: handleRollback,
    setActiveEntity,
    setActiveRecord,
  };
}
