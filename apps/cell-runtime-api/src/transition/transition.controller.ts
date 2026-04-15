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
import type { EntityService, EntityRuntimeContext } from '@ikary/cell-runtime-core';
import {
  TransitionService,
  EntityNotFoundError,
  InvalidTransitionError,
  OutboxRepository,
} from '@ikary/cell-runtime-core';
import { JwtAuthGuard, AuditInterceptor, UserService, type CurrentAuthValue } from '@ikary/system-auth';
import { RUNTIME_CONTEXT_TOKEN, type RuntimeContext } from '../runtime-context.js';

@ApiTags('transitions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('entities/:entityKey/records/:id/transitions')
export class TransitionController {
  private readonly transitionService: TransitionService;

  constructor(
    @Inject('ENTITY_SERVICE') private readonly entityService: EntityService,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(RUNTIME_CONTEXT_TOKEN) private readonly runtimeCtx: RuntimeContext,
    @Inject('OUTBOX_REPOSITORY') private readonly outbox: OutboxRepository,
  ) {
    this.transitionService = new TransitionService(entityService, outbox);
  }

  @Post(':transitionKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a lifecycle transition on an entity record' })
  @ApiParam({ name: 'entityKey', description: 'Entity key (e.g. invoice)' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  @ApiParam({ name: 'transitionKey', description: 'Transition key (e.g. publish)' })
  async execute(
    @Param('entityKey') entityKey: string,
    @Param('id') id: string,
    @Param('transitionKey') transitionKey: string,
    @Body() _body: Record<string, unknown>,
    @Req() req: any,
  ) {
    const entityDef = this.runtimeCtx.manifest.spec.entities?.find((e) => e.key === entityKey);
    if (!entityDef) {
      throw new HttpException(`Entity "${entityKey}" not found in manifest`, HttpStatus.NOT_FOUND);
    }

    const lifecycle = entityDef.lifecycle;
    if (!lifecycle) {
      throw new HttpException(
        `Entity "${entityKey}" has no lifecycle definition`,
        HttpStatus.NOT_FOUND,
      );
    }

    const transition = lifecycle.transitions.find((t) => t.key === transitionKey);
    if (!transition) {
      throw new HttpException(
        `Transition "${transitionKey}" not found on entity "${entityKey}"`,
        HttpStatus.NOT_FOUND,
      );
    }

    const ctx = this.buildCtx(entityKey, req);

    try {
      return await this.transitionService.execute(entityKey, id, lifecycle, transition, ctx);
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      if (err instanceof EntityNotFoundError) {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
      throw err;
    }
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
