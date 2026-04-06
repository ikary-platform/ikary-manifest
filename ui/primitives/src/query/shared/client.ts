import type { RuntimeContext } from '../../registry/resolverRegistry';
import type { ListParams, ListResult } from './list';
import type { GetParams } from './get';
import type { AggregateParams, AggregateResult } from './aggregate';
import type { CreateResult, UpdateResult, DeleteResult } from './mutation';

export interface EntityClient {
  list<T = Record<string, unknown>>(
    context: RuntimeContext,
    params: ListParams,
    signal?: AbortSignal,
  ): Promise<ListResult<T>>;

  get<T = Record<string, unknown>>(context: RuntimeContext, params: GetParams, signal?: AbortSignal): Promise<T | null>;

  aggregate(context: RuntimeContext, params: AggregateParams, signal?: AbortSignal): Promise<AggregateResult>;

  create<TInput extends Record<string, unknown>, TOutput = TInput>(
    context: RuntimeContext,
    entity: string,
    input: TInput,
  ): Promise<CreateResult<TOutput>>;

  update<TInput extends Record<string, unknown>, TOutput = TInput>(
    context: RuntimeContext,
    entity: string,
    id: string,
    input: Partial<TInput>,
  ): Promise<UpdateResult<TOutput>>;

  remove(context: RuntimeContext, entity: string, id: string): Promise<DeleteResult>;
}
