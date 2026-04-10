import { useQuery } from '@tanstack/react-query';
import type { EntityRouteParams } from '@ikary/contract';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import { cellApiFetch } from '../cell-api-client';
import { useCellApi } from '../cell-api-context';
import { localEntityItemUrl } from '../local-routes';
import type { CellApiError } from '../cell-api-error';

export interface AuditLogEntry {
  id: string;
  eventType: string;
  resourceVersion: number;
  actorId: string | null;
  actorType: string;
  actorEmail: string | null;
  changeKind: string;
  snapshot: unknown;
  diff: unknown;
  occurredAt: string;
  requestId: string | null;
}

export interface AuditLogPage {
  data: AuditLogEntry[];
  total: number;
}

export function useCellEntityAuditLog(
  params: EntityRouteParams,
  id: string | null | undefined,
  page = 1,
  pageSize = 20,
) {
  const { apiBase, getToken } = useCellApi();
  return useQuery<AuditLogPage, CellApiError>({
    queryKey: [...cellEntityQueryKeys.audit(params, id ?? ''), page, pageSize],
    queryFn: () => {
      const base = localEntityItemUrl(params.entityKey, id!, apiBase);
      const url = `${base}/audit?page=${page}&pageSize=${pageSize}`;
      return cellApiFetch<AuditLogPage>({ url, method: 'GET', token: getToken() });
    },
    enabled: Boolean(id),
  });
}
