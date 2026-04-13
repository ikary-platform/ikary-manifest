import type { EntityClient } from '../shared/client';
import type { ListParams, ListResult } from '../shared/list';
import type { GetParams } from '../shared/get';
import type { AggregateParams, AggregateResult } from '../shared/aggregate';
import type { CreateResult, UpdateResult, DeleteResult } from '../shared/mutation';
import type { RuntimeContext } from '../../registry/resolverRegistry';
import { applyFilters } from '../utils/applyFilters';
import { applySort } from '../utils/applySort';
import { paginate } from '../utils/paginate';
import { projectFields } from '../utils/projectFields';
import { delay } from '../utils/delay';
import { fakeStore } from '../utils/fakeStore';

function resolveWorkspaceId(context: RuntimeContext): string {
  return context.workspaceId ?? 'playground';
}

export const fakeEntityClient: EntityClient = {
  async list<T = Record<string, unknown>>(
    context: RuntimeContext,
    params: ListParams,
    _signal?: AbortSignal,
  ): Promise<ListResult<T>> {
    await delay();
    const wsId = resolveWorkspaceId(context);
    const all = fakeStore.ensureEntity(wsId, params.entity, context);
    const filtered = applyFilters(all, params.filter);
    const sorted = applySort(filtered, params.sort);
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const result = paginate(sorted, page, pageSize);
    const projected = result.items.map((r) => projectFields(r, params.fields));
    return { ...result, items: projected as T[] };
  },

  async get<T = Record<string, unknown>>(
    context: RuntimeContext,
    params: GetParams,
    _signal?: AbortSignal,
  ): Promise<T | null> {
    await delay();
    const wsId = resolveWorkspaceId(context);
    const all = fakeStore.ensureEntity(wsId, params.entity, context);
    const found = all.find((r) => r['id'] === params.id) ?? null;
    if (!found) return null;
    return projectFields(found, params.fields) as T;
  },

  async aggregate(context: RuntimeContext, params: AggregateParams, _signal?: AbortSignal): Promise<AggregateResult> {
    await delay();
    const wsId = resolveWorkspaceId(context);
    const all = fakeStore.ensureEntity(wsId, params.entity, context);
    const filtered = applyFilters(all, params.filter);
    const values: Record<string, number | null> = {};

    for (const metric of params.metrics) {
      switch (metric.op) {
        case 'count':
          values[metric.as] = filtered.length;
          break;
        case 'sum': {
          const nums = filtered.map((r) => Number(r[(metric as { field: string }).field] ?? 0));
          values[metric.as] = nums.reduce((acc, v) => acc + v, 0);
          break;
        }
        case 'avg': {
          if (filtered.length === 0) {
            values[metric.as] = null;
            break;
          }
          const nums = filtered.map((r) => Number(r[(metric as { field: string }).field] ?? 0));
          values[metric.as] = nums.reduce((acc, v) => acc + v, 0) / nums.length;
          break;
        }
        case 'min': {
          if (filtered.length === 0) {
            values[metric.as] = null;
            break;
          }
          const nums = filtered.map((r) => Number(r[(metric as { field: string }).field] ?? 0));
          values[metric.as] = Math.min(...nums);
          break;
        }
        case 'max': {
          if (filtered.length === 0) {
            values[metric.as] = null;
            break;
          }
          const nums = filtered.map((r) => Number(r[(metric as { field: string }).field] ?? 0));
          values[metric.as] = Math.max(...nums);
          break;
        }
      }
    }
    return { values };
  },

  async create<TInput extends Record<string, unknown>, TOutput = TInput>(
    context: RuntimeContext,
    entity: string,
    input: TInput,
  ): Promise<CreateResult<TOutput>> {
    await delay();
    const wsId = resolveWorkspaceId(context);
    const all = fakeStore.ensureEntity(wsId, entity, context);
    const record = { id: `${entity}-${Date.now()}`, ...input };
    fakeStore.replaceEntity(wsId, entity, [...all, record]);
    return { record: record as unknown as TOutput };
  },

  async update<TInput extends Record<string, unknown>, TOutput = TInput>(
    context: RuntimeContext,
    entity: string,
    id: string,
    input: Partial<TInput>,
  ): Promise<UpdateResult<TOutput>> {
    await delay();
    const wsId = resolveWorkspaceId(context);
    const all = fakeStore.ensureEntity(wsId, entity, context);
    const idx = all.findIndex((r) => r['id'] === id);
    if (idx === -1) throw new Error(`[fakeEntityClient] ${entity} ${id} not found`);
    const updated = { ...all[idx], ...input };
    const next = [...all];
    next[idx] = updated;
    fakeStore.replaceEntity(wsId, entity, next);
    return { record: updated as unknown as TOutput };
  },

  async remove(context: RuntimeContext, entity: string, id: string): Promise<DeleteResult> {
    await delay();
    const wsId = resolveWorkspaceId(context);
    const all = fakeStore.ensureEntity(wsId, entity, context);
    fakeStore.replaceEntity(
      wsId,
      entity,
      all.filter((r) => r['id'] !== id),
    );
    return { id };
  },
};
