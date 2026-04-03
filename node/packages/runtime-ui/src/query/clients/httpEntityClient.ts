// HTTP Entity Client — compile-safe skeleton
// Implement when backend API is available.
// This file must not change the public EntityClient contract.

import type { EntityClient } from '../shared/client';
import type { ListParams, ListResult } from '../shared/list';
import type { GetParams } from '../shared/get';
import type { AggregateParams, AggregateResult } from '../shared/aggregate';
import type { CreateResult, UpdateResult, DeleteResult } from '../shared/mutation';
import type { RuntimeContext } from '../../registry/resolverRegistry';

function baseUrl(context: RuntimeContext): string {
  return '/api'; // TODO: context.apiBaseUrl ?? '/api'
}

function workspaceUrl(context: RuntimeContext, entity: string): string {
  const wsId = context.workspaceId ?? 'playground';
  return `${baseUrl(context)}/workspaces/${wsId}/entities/${entity}`;
}

export const httpEntityClient: EntityClient = {
  async list<T = Record<string, unknown>>(
    context: RuntimeContext,
    params: ListParams,
    signal?: AbortSignal,
  ): Promise<ListResult<T>> {
    // TODO: serialize params.filter + params.sort into query string or POST body
    const url = `${workspaceUrl(context, params.entity)}?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`[httpEntityClient] list ${params.entity} failed: ${res.status}`);
    return res.json() as Promise<ListResult<T>>;
  },

  async get<T = Record<string, unknown>>(
    context: RuntimeContext,
    params: GetParams,
    signal?: AbortSignal,
  ): Promise<T | null> {
    const url = `${workspaceUrl(context, params.entity)}/${params.id}`;
    const res = await fetch(url, { signal });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`[httpEntityClient] get ${params.entity}/${params.id} failed: ${res.status}`);
    return res.json() as Promise<T>;
  },

  async aggregate(context: RuntimeContext, params: AggregateParams, signal?: AbortSignal): Promise<AggregateResult> {
    const url = `${workspaceUrl(context, params.entity)}/aggregate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal,
    });
    if (!res.ok) throw new Error(`[httpEntityClient] aggregate ${params.entity} failed: ${res.status}`);
    return res.json() as Promise<AggregateResult>;
  },

  async create<TInput extends Record<string, unknown>, TOutput = TInput>(
    context: RuntimeContext,
    entity: string,
    input: TInput,
  ): Promise<CreateResult<TOutput>> {
    const url = workspaceUrl(context, entity);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`[httpEntityClient] create ${entity} failed: ${res.status}`);
    return res.json() as Promise<CreateResult<TOutput>>;
  },

  async update<TInput extends Record<string, unknown>, TOutput = TInput>(
    context: RuntimeContext,
    entity: string,
    id: string,
    input: Partial<TInput>,
  ): Promise<UpdateResult<TOutput>> {
    const url = `${workspaceUrl(context, entity)}/${id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`[httpEntityClient] update ${entity}/${id} failed: ${res.status}`);
    return res.json() as Promise<UpdateResult<TOutput>>;
  },

  async remove(context: RuntimeContext, entity: string, id: string): Promise<DeleteResult> {
    const url = `${workspaceUrl(context, entity)}/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`[httpEntityClient] delete ${entity}/${id} failed: ${res.status}`);
    return { id };
  },
};
