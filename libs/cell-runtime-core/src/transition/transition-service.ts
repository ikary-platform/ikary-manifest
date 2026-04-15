import { randomUUID } from 'node:crypto';
import type { LifecycleDefinition, LifecycleTransitionDefinition, DomainEventEnvelope } from '@ikary/cell-contract';
import type { EntityService } from '../entity/entity-service.js';
import type { EntityRuntimeContext } from '../entity/entity-runtime-context.js';
import { EntityNotFoundError, InvalidTransitionError } from '../errors.js';

export class TransitionService {
  constructor(private readonly entityService: EntityService) {}

  /**
   * Execute a lifecycle transition on an entity record.
   *
   * Uses optimistic locking (passes `record.version` as `expectedVersion`) so
   * concurrent requests that both pass the state-guard can only one commit —
   * the second gets `VersionConflictError` (HTTP 409).
   *
   * Hook outbox events are passed as `extraOutboxEvents` to `EntityService.update`
   * so they land in the same database transaction as the entity write, audit entry,
   * and transition event — all-or-nothing.
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
        String(currentState),
        transition.from,
      );
    }

    const currentVersion = record['version'] as number;

    // Build hook envelopes using predicted new version (currentVersion + 1).
    // These are inserted in the same transaction as the entity update via extraOutboxEvents.
    const hookEnvelopes: DomainEventEnvelope[] = (transition.hooks ?? []).map((hookKey) =>
      this.buildHookEnvelope(hookKey, entityKey, entityId, currentVersion + 1, ctx),
    );

    return this.entityService.update(
      entityKey,
      entityId,
      { [lifecycle.field]: transition.to },
      currentVersion, // optimistic lock — prevents concurrent double-transition
      {
        ...ctx,
        eventNames: {
          ...(ctx?.eventNames ?? {}),
          updated: transition.event ?? 'entity.transitioned',
        },
      },
      hookEnvelopes, // written atomically with entity + audit + transition event
    );
  }

  private buildHookEnvelope(
    hookKey: string,
    entityKey: string,
    entityId: string,
    version: number,
    ctx: EntityRuntimeContext | undefined,
  ): DomainEventEnvelope {
    return {
      event_id: randomUUID(),
      event_name: 'entity.hook.invoked',
      version,
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
