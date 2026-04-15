import { randomUUID } from 'node:crypto';
import type { LifecycleDefinition, LifecycleTransitionDefinition, DomainEventEnvelope } from '@ikary/cell-contract';
import type { EntityService } from '../entity/entity-service.js';
import type { OutboxRepository } from '../outbox/outbox-repository.js';
import type { EntityRuntimeContext } from '../entity/entity-runtime-context.js';
import { EntityNotFoundError, InvalidTransitionError } from '../errors.js';

export class TransitionService {
  constructor(
    private readonly entityService: EntityService,
    private readonly outbox?: OutboxRepository,
  ) {}

  /**
   * Execute a lifecycle transition on an entity record.
   *
   * - Validates current state matches `transition.from`
   * - Applies `{ [lifecycle.field]: transition.to }` via EntityService.update
   *   (which writes entity + audit + outbox atomically)
   * - Emits a separate outbox event for each declared hook so the worker
   *   can execute side-effects without coupling OSS to external services
   */
  async execute(
    entityKey: string,
    entityId: string,
    lifecycle: LifecycleDefinition,
    transition: LifecycleTransitionDefinition,
    ctx?: EntityRuntimeContext,
  ): Promise<Record<string, unknown>> {
    const record = await this.entityService.findById(entityKey, entityId);
    if (!record) throw new EntityNotFoundError(entityKey, entityId);

    const currentState = record[lifecycle.field] as string | undefined;
    if (currentState !== transition.from) {
      throw new InvalidTransitionError(
        entityKey,
        transition.key,
        currentState ?? '(undefined)',
        transition.from,
      );
    }

    // Resolve the event name for this transition
    const eventNames = {
      ...(ctx?.eventNames ?? {}),
      updated: transition.event ?? `entity.transitioned`,
    };

    const updated = await this.entityService.update(
      entityKey,
      entityId,
      { [lifecycle.field]: transition.to },
      undefined,
      { ...ctx, eventNames },
    );

    // Emit hook events so the worker can run side-effects asynchronously.
    // OSS never calls external services — it only writes to the outbox.
    if (this.outbox && transition.hooks?.length) {
      for (const hookKey of transition.hooks) {
        await this.outbox.insert(this.buildHookEnvelope(hookKey, entityKey, entityId, updated, ctx));
      }
    }

    return updated;
  }

  private buildHookEnvelope(
    hookKey: string,
    entityKey: string,
    entityId: string,
    record: Record<string, unknown>,
    ctx: EntityRuntimeContext | undefined,
  ): DomainEventEnvelope {
    return {
      event_id: randomUUID(),
      event_name: 'entity.hook.invoked',
      version: (record['version'] as number | undefined) ?? 1,
      timestamp: new Date().toISOString(),
      tenant_id: ctx?.tenantId ?? 'local',
      workspace_id: ctx?.workspaceId ?? 'local',
      cell_id: ctx?.cellId ?? 'local',
      actor: {
        type: ctx?.actorId ? 'user' : 'system',
        id: ctx?.actorId ?? 'system',
      },
      entity: { type: entityKey, id: entityId },
      data: { hook_key: hookKey },
      previous: {},
      metadata: { requestId: ctx?.requestId ?? null },
    };
  }
}
