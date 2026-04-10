import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  EntityApiAdapter,
  EntityListResponse,
  EntityItemResponse,
  AuditLogPage,
  UpdateVars,
  RollbackVars,
} from '@ikary/renderer';
import { getRuntimeConfig } from '../runtime-config.js';

const EMPTY_LIST: EntityListResponse = { data: [], total: 0 };

/**
 * Implements EntityApiAdapter by calling the local cell-runtime-api REST endpoints.
 *
 * @deprecated Use `useRQEntityAdapter` from `./use-rq-entity-adapter` instead.
 * This adapter uses plain fetch+useState — the replacement uses React Query with
 * proper cache invalidation, correlation IDs, and query key scoping.
 */
export function useLocalEntityAdapter(): EntityApiAdapter {
  const { dataApiUrl } = getRuntimeConfig();
  const apiBase = dataApiUrl ?? 'http://localhost:4501';

  const [activeEntityKey, setActiveEntityKeyState] = useState<string>('');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [listData, setListData] = useState<EntityListResponse>(EMPTY_LIST);
  const [listLoading, setListLoading] = useState(false);
  const [detailData, setDetailData] = useState<EntityItemResponse | null>(null);
  const [auditData, setAuditData] = useState<AuditLogPage | undefined>(undefined);

  const fetchList = useCallback(async (entityKey: string) => {
    if (!entityKey) return;
    setListLoading(true);
    try {
      const res = await fetch(`${apiBase}/entities/${entityKey}/records`);
      const json = await res.json();
      setListData(json);
    } catch {
      setListData(EMPTY_LIST);
    } finally {
      setListLoading(false);
    }
  }, [apiBase]);

  const fetchDetail = useCallback(async (entityKey: string, id: string) => {
    try {
      const res = await fetch(`${apiBase}/entities/${entityKey}/records/${id}`);
      const json = await res.json();
      setDetailData({ data: json });
    } catch {
      setDetailData(null);
    }
  }, [apiBase]);

  const fetchAudit = useCallback(async (entityKey: string, id: string) => {
    try {
      const res = await fetch(`${apiBase}/entities/${entityKey}/records/${id}/audit`);
      const json: any[] = await res.json();
      setAuditData({
        data: json.map((e) => ({
          id: String(e.id),
          eventType: e.event_type,
          resourceVersion: e.resource_version,
          actorId: null,
          actorType: 'system',
          actorEmail: null,
          changeKind: e.change_kind,
          snapshot: JSON.parse(e.snapshot ?? '{}'),
          diff: e.diff ? JSON.parse(e.diff) : null,
          occurredAt: e.occurred_at,
          requestId: null,
        })),
        total: json.length,
      });
    } catch {
      setAuditData(undefined);
    }
  }, [apiBase]);

  useEffect(() => {
    if (activeEntityKey) fetchList(activeEntityKey);
  }, [activeEntityKey, fetchList]);

  useEffect(() => {
    if (activeEntityKey && activeRecordId) {
      fetchDetail(activeEntityKey, activeRecordId);
      fetchAudit(activeEntityKey, activeRecordId);
    }
  }, [activeEntityKey, activeRecordId, fetchDetail, fetchAudit]);

  const createAsync = useCallback(async (data: Record<string, unknown>): Promise<EntityItemResponse> => {
    const res = await fetch(`${apiBase}/entities/${activeEntityKey}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    await fetchList(activeEntityKey);
    return { data: json };
  }, [apiBase, activeEntityKey, fetchList]);

  const updateAsync = useCallback(async ({ id, data, expectedVersion }: UpdateVars): Promise<EntityItemResponse | undefined> => {
    const body = expectedVersion !== undefined ? { ...data, expectedVersion } : data;
    const res = await fetch(`${apiBase}/entities/${activeEntityKey}/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    await fetchList(activeEntityKey);
    if (activeRecordId === id) await fetchDetail(activeEntityKey, id);
    return { data: json };
  }, [apiBase, activeEntityKey, activeRecordId, fetchList, fetchDetail]);

  const deleteAsync = useCallback(async (id: string): Promise<unknown> => {
    await fetch(`${apiBase}/entities/${activeEntityKey}/records/${id}`, { method: 'DELETE' });
    await fetchList(activeEntityKey);
    if (activeRecordId === id) setDetailData(null);
    return undefined;
  }, [apiBase, activeEntityKey, activeRecordId, fetchList]);

  const rollbackAsync = useCallback(async ({ id, targetVersion, expectedVersion }: RollbackVars): Promise<unknown> => {
    const res = await fetch(`${apiBase}/entities/${activeEntityKey}/records/${id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetVersion, expectedVersion }),
    });
    const json = await res.json();
    await fetchList(activeEntityKey);
    if (activeRecordId === id) await fetchDetail(activeEntityKey, id);
    return json;
  }, [apiBase, activeEntityKey, activeRecordId, fetchList, fetchDetail]);

  const setActiveEntity = useCallback((entityKey: string) => {
    setActiveEntityKeyState(entityKey);
  }, []);

  const setActiveRecord = useCallback((entityKey: string, id: string) => {
    setActiveEntityKeyState(entityKey);
    setActiveRecordId(id);
  }, []);

  return {
    listData,
    listLoading,
    detailData,
    auditData,
    createAsync,
    updateAsync,
    deleteAsync,
    rollbackAsync,
    setActiveEntity,
    setActiveRecord,
  };
}
