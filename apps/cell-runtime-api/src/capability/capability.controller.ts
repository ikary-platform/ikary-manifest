import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { CapabilityDefinition, DomainEventEnvelope } from '@ikary/cell-contract';
import type { EntityRuntimeContext } from '@ikary/cell-runtime-core';
import type { EntityService } from '@ikary/cell-runtime-core';
import {
  TransitionService,
  EntityNotFoundError,
  InvalidTransitionError,
  CapabilityNotFoundError,
  OutboxRepository,
  VersionConflictError,
} from '@ikary/cell-runtime-core';
import { JwtAuthGuard, AuditInterceptor, UserService, type CurrentAuthValue } from '@ikary/system-auth';
import { RUNTIME_CONTEXT_TOKEN, type RuntimeContext } from '../runtime-context.js';

@ApiTags('capabilities')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('entities/:entityKey/records/:id/capabilities')
export class CapabilityController {
  private readonly transitionService: TransitionService;

  constructor(
    @Inject('ENTITY_SERVICE') private readonly entityService: EntityService,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(RUNTIME_CONTEXT_TOKEN) private readonly runtimeCtx: RuntimeContext,
    @Inject('OUTBOX_REPOSITORY') private readonly outbox: OutboxRepository,
  ) {
    this.transitionService = new TransitionService(entityService, outbox);
  }

  @Post(':capabilityKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a capability on an entity record' })
  @ApiParam({ name: 'entityKey' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'capabilityKey' })
  async execute(
    @Param('entityKey') entityKey: string,
    @Param('id') id: string,
    @Param('capabilityKey') capabilityKey: string,
    @Body() body: Record<string, unknown>,
    @Req() req: any,
  ) {
    const entityDef = this.runtimeCtx.manifest.spec.entities?.find((e) => e.key === entityKey);
    if (!entityDef) {
      throw new HttpException(`Entity "${entityKey}" not found in manifest`, HttpStatus.NOT_FOUND);
    }

    const capability = entityDef.capabilities?.find((c) => c.key === capabilityKey);
    if (!capability) {
      throw new HttpException(
        new CapabilityNotFoundError(entityKey, capabilityKey).message,
        HttpStatus.NOT_FOUND,
      );
    }

    const ctx = this.buildCtx(entityKey, req);

    try {
      return await this.dispatch(entityKey, id, capability, ctx, body);
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      if (err instanceof VersionConflictError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      if (err instanceof EntityNotFoundError) {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
      throw err;
    }
  }

  /**
   * Route capability by type:
   *
   * - transition → execute state machine (OSS, synchronous)
   * - mutation   → apply declared patch (OSS, synchronous)
   * - workflow   → emit event to outbox, worker handles it
   * - integration → emit event to outbox, worker calls external provider
   * - export     → emit event to outbox, worker generates and delivers file
   */
  private async dispatch(
    entityKey: string,
    id: string,
    capability: CapabilityDefinition,
    ctx: EntityRuntimeContext,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown> | { queued: true; event_id: string }> {
    switch (capability.type) {
      case 'transition': {
        const entityDef = this.runtimeCtx.manifest.spec.entities?.find((e) => e.key === entityKey)!;
        const lifecycle = entityDef.lifecycle;
        if (!lifecycle) {
          throw new HttpException(
            `Entity "${entityKey}" has no lifecycle definition`,
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        const transition = lifecycle.transitions.find((t) => t.key === capability.transition);
        if (!transition) {
          throw new HttpException(
            `Transition "${capability.transition}" not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        return this.transitionService.execute(entityKey, id, lifecycle, transition, ctx);
      }

      case 'mutation': {
        return this.entityService.update(entityKey, id, capability.updates as Record<string, unknown>, undefined, ctx);
      }

      case 'workflow':
      case 'integration':
      case 'export': {
        // OSS emits an event to the outbox. The worker handles execution.
        const eventName = `capability.${capability.type}.triggered`;
        const event = this.buildCapabilityEnvelope(eventName, entityKey, id, capability, ctx, body);
        await this.outbox.insert(event);
        return { queued: true, event_id: event.event_id };
      }
    }
  }

  private buildCapabilityEnvelope(
    eventName: string,
    entityKey: string,
    entityId: string,
    capability: CapabilityDefinition,
    ctx: EntityRuntimeContext,
    inputs: Record<string, unknown>,
  ): DomainEventEnvelope {
    return {
      event_id: randomUUID(),
      event_name: eventName,
      version: 1,
      timestamp: new Date().toISOString(),
      tenant_id: ctx.tenantId ?? 'local',
      workspace_id: ctx.workspaceId ?? 'local',
      cell_id: ctx.cellId ?? 'local',
      actor: {
        type: ctx.actorId ? 'user' : 'system',
        id: ctx.actorId ?? 'system',
      },
      entity: { type: entityKey, id: entityId },
      data: { capability_key: capability.key, capability_type: capability.type, inputs },
      previous: {},
      metadata: { requestId: ctx.requestId ?? null },
    };
  }

  private buildCtx(
    entityKey: string,
    request: { auth?: CurrentAuthValue; headers?: Record<string, string | string[] | undefined> },
  ): EntityRuntimeContext {
    const rawRequestId = request.headers?.['x-request-id'];
    const requestId = Array.isArray(rawRequestId) ? rawRequestId[0] : rawRequestId;
    const entityDef = this.runtimeCtx.manifest.spec.entities?.find((e) => e.key === entityKey);
    return {
      actorId: request.auth?.userId,
      requestId,
      cellId: this.runtimeCtx.manifest.metadata.key,
      eventNames: entityDef?.events?.names,
      excludeFields: entityDef?.events?.exclude,
    };
  }
}
