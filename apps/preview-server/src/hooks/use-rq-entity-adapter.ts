import { useState, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  useCellEntityAuditLog,
  useCellApi,
  cellApiFetch,
  cellEntityQueryKeys,
  localEntityBaseUrl,
  localEntityItemUrl,
  type AuditLogEntry,
} from '@ikary/data';

const EMPTY_LIST: EntityListResponse = { data: [], total: 0 };

/**
 * Implements `EntityApiAdapter` using the React Query hooks from `@ikary/data`.
 *
 * Read operations use declarative React Query hooks.
 * Mutations use `cellApiFetch` directly with a ref-tracked entity key to avoid
 * stale closures — the renderer's `useCreateApiDataStore` may call mutations
 * before `setActiveEntity` has triggered a re-render.
 *
 * Requires a surrounding `<CellApiProvider>` in the tree.
 */
export function useRQEntityAdapter(cellKey: string): EntityApiAdapter {
  const [activeEntityKey, setActiveEntityKey] = useState('');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const { apiBase, getToken } = useCellApi();
  const queryClient = useQueryClient();

  // Ref tracks the latest entity key so mutations always see the current value
  // even if called before React re-renders after setActiveEntity.
  const entityKeyRef = useRef('');
  const recordIdRef = useRef<string | null>(null);

  // Build route params for read hooks and query key invalidation
  const routeParams: EntityRouteParams = useMemo(
    () => ({
      tenantId: 'local',
      workspaceId: 'local',
      cellKey,
      entityKey: activeEntityKey,
    }),
    [cellKey, activeEntityKey],
  );

  // Helper: build route params from the ref (always current)
  const currentRouteParams = useCallback(
    (): EntityRouteParams => ({
      tenantId: 'local',
      workspaceId: 'local',
      cellKey,
      entityKey: entityKeyRef.current,
    }),
    [cellKey],
  );

  // ── Read hooks (declarative — React Query manages reactivity) ──────────────

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

  // ── Mutations (imperative — use cellApiFetch + ref for current entity) ─────

  const listData: EntityListResponse = useMemo(
    () => {
      if (!activeEntityKey) return EMPTY_LIST;
      // Guard against malformed or pending responses
      const resp = listResponse as EntityListResponse;
      if (!resp?.data || !Array.isArray(resp.data)) return EMPTY_LIST;
      return resp;
    },
    [activeEntityKey, listResponse],
  );

  const detailData: EntityItemResponse | null = useMemo(
    () => (detailResponse ? (detailResponse as EntityItemResponse) : null),
    [detailResponse],
  );

  const handleCreate = useCallback(
    async (data: Record<string, unknown>): Promise<EntityItemResponse> => {
      const ek = entityKeyRef.current;
      const url = localEntityBaseUrl(ek, apiBase);
      const result = await cellApiFetch<EntityItemResponse>({
        url,
        method: 'POST',
        body: data,
        token: getToken(),
      });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(currentRouteParams()) });
      return result;
    },
    [apiBase, getToken, queryClient, currentRouteParams],
  );

  const handleUpdate = useCallback(
    async ({ id, data, expectedVersion }: { id: string; data: Record<string, unknown>; expectedVersion?: number }): Promise<EntityItemResponse | undefined> => {
      const ek = entityKeyRef.current;
      const url = localEntityItemUrl(ek, id, apiBase);
      const body = expectedVersion !== undefined ? { ...data, expectedVersion } : data;
      const result = await cellApiFetch<EntityItemResponse>({
        url,
        method: 'PATCH',
        body,
        token: getToken(),
      });
      const params = currentRouteParams();
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(params) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.detail(params, id) });
      return result;
    },
    [apiBase, getToken, queryClient, currentRouteParams],
  );

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      const ek = entityKeyRef.current;
      const url = localEntityItemUrl(ek, id, apiBase);
      await cellApiFetch<unknown>({ url, method: 'DELETE', token: getToken() });
      const params = currentRouteParams();
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(params) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.detail(params, id) });
    },
    [apiBase, getToken, queryClient, currentRouteParams],
  );

  const handleRollback = useCallback(
    async ({ id, targetVersion, expectedVersion }: { id: string; targetVersion: number; expectedVersion?: number }): Promise<unknown> => {
      const ek = entityKeyRef.current;
      const url = `${localEntityItemUrl(ek, id, apiBase)}/rollback`;
      const body: Record<string, unknown> = { targetVersion };
      if (expectedVersion !== undefined) body['expectedVersion'] = expectedVersion;
      const result = await cellApiFetch<unknown>({ url, method: 'POST', body, token: getToken() });
      const params = currentRouteParams();
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.lists(params) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.detail(params, id) });
      await queryClient.invalidateQueries({ queryKey: cellEntityQueryKeys.audit(params, id) });
      return result;
    },
    [apiBase, getToken, queryClient, currentRouteParams],
  );

  const setActiveEntity = useCallback((entityKey: string) => {
    entityKeyRef.current = entityKey;
    setActiveEntityKey(entityKey);
    setActiveRecordId(null);
    recordIdRef.current = null;
  }, []);

  const setActiveRecord = useCallback((entityKey: string, id: string) => {
    entityKeyRef.current = entityKey;
    recordIdRef.current = id;
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
