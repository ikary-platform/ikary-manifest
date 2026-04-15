import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  HttpException,
  HttpStatus,
  Inject,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { EntityService, EntityRuntimeContext } from '@ikary/cell-runtime-core';
import type { AuditLogRow } from '@ikary/cell-runtime-core';
import { EntityNotFoundError, VersionConflictError } from '@ikary/cell-runtime-core';
import { JwtAuthGuard, AuditInterceptor, UserService, type CurrentAuthValue } from '@ikary/system-auth';
import { RUNTIME_CONTEXT_TOKEN, type RuntimeContext } from '../runtime-context.js';

@ApiTags('entities')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('entities/:entityKey/records')
export class EntityController {
  constructor(
    @Inject('ENTITY_SERVICE') private readonly entityService: EntityService,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(RUNTIME_CONTEXT_TOKEN) private readonly runtimeCtx: RuntimeContext,
  ) {}

  private buildCtx(
    entityKey: string,
    request: { auth?: CurrentAuthValue; headers?: Record<string, string | string[] | undefined> },
  ): EntityRuntimeContext {
    const rawRequestId = request.headers?.['x-request-id'];
    const requestId = Array.isArray(rawRequestId) ? rawRequestId[0] : rawRequestId;

    const entityDef = this.runtimeCtx.manifest.spec.entities?.find((e) => e.key === entityKey);
    const eventDef = entityDef?.events;

    return {
      actorId: request.auth?.userId,
      requestId,
      cellId: this.runtimeCtx.manifest.metadata.key,
      eventNames: eventDef?.names,
      excludeFields: eventDef?.exclude,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List entity records' })
  @ApiParam({ name: 'entityKey', description: 'Entity key (e.g. customer)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  async list(
    @Param('entityKey') entityKey: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.entityService.list(entityKey, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort,
      order,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single entity record' })
  async getOne(@Param('entityKey') entityKey: string, @Param('id') id: string) {
    const record = await this.entityService.findById(entityKey, id);
    if (!record) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return record;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an entity record' })
  async create(@Param('entityKey') entityKey: string, @Body() body: Record<string, unknown>, @Req() req: any) {
    return this.entityService.create(entityKey, body, this.buildCtx(entityKey, req));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an entity record' })
  async update(
    @Param('entityKey') entityKey: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: any,
  ) {
    const { expectedVersion, ...patch } = body;
    try {
      return await this.entityService.update(entityKey, id, patch, expectedVersion as number | undefined, this.buildCtx(entityKey, req));
    } catch (err) {
      if (err instanceof VersionConflictError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      if (err instanceof EntityNotFoundError) {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
      throw err;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an entity record' })
  async remove(
    @Param('entityKey') entityKey: string,
    @Param('id') id: string,
    @Query('expectedVersion') expectedVersion?: string,
    @Req() req?: any,
  ) {
    try {
      await this.entityService.delete(
        entityKey,
        id,
        expectedVersion !== undefined ? Number(expectedVersion) : undefined,
        req ? this.buildCtx(entityKey, req) : undefined,
      );
    } catch (err) {
      if (err instanceof VersionConflictError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      if (err instanceof EntityNotFoundError) {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
      throw err;
    }
  }

  @Get(':id/audit')
  @ApiOperation({ summary: 'Get audit log for an entity record' })
  async audit(@Param('entityKey') entityKey: string, @Param('id') id: string) {
    const rows = await this.entityService.getAuditLog(entityKey, id);

    // Resolve actor emails for all distinct actor_ids
    const actorIds = [...new Set(rows.map((r: AuditLogRow) => r.actor_id).filter(Boolean))] as string[];
    const emailMap = new Map<string, string>();
    for (const actorId of actorIds) {
      try {
        const user = await this.userService.findById(actorId);
        if (user?.email) emailMap.set(actorId, user.email);
      } catch {
        // user lookup failed — skip
      }
    }

    return rows.map((r: AuditLogRow) => ({
      id: String(r.id),
      eventType: r.event_type,
      resourceVersion: r.resource_version,
      actorId: r.actor_id ?? null,
      actorType: r.actor_id ? 'user' : 'system',
      actorEmail: r.actor_id ? (emailMap.get(r.actor_id) ?? null) : null,
      changeKind: r.change_kind,
      snapshot: typeof r.snapshot === 'string' ? JSON.parse(r.snapshot) : r.snapshot,
      diff: r.diff ? (typeof r.diff === 'string' ? JSON.parse(r.diff) : r.diff) : null,
      occurredAt: r.occurred_at,
      requestId: r.request_id ?? null,
    }));
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Roll back an entity record to a previous version' })
  async rollback(
    @Param('entityKey') entityKey: string,
    @Param('id') id: string,
    @Body() body: { targetVersion: number; expectedVersion?: number },
    @Req() req: any,
  ) {
    try {
      return await this.entityService.rollback(
        entityKey,
        id,
        body.targetVersion,
        body.expectedVersion,
        this.buildCtx(entityKey, req),
      );
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
      if (err instanceof VersionConflictError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      throw err;
    }
  }
}
