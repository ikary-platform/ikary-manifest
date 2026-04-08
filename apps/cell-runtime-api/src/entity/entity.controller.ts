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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { EntityService } from '@ikary/cell-runtime-core';
import { EntityNotFoundError, VersionConflictError } from '@ikary/cell-runtime-core';

@ApiTags('entities')
@Controller('entities/:entityKey/records')
export class EntityController {
  constructor(
    @Inject('ENTITY_SERVICE') private readonly entityService: EntityService,
  ) {}

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
  async create(@Param('entityKey') entityKey: string, @Body() body: Record<string, unknown>) {
    return this.entityService.create(entityKey, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an entity record' })
  async update(
    @Param('entityKey') entityKey: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { expectedVersion, ...patch } = body;
    try {
      return await this.entityService.update(entityKey, id, patch, expectedVersion as number | undefined);
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
  ) {
    try {
      await this.entityService.delete(
        entityKey,
        id,
        expectedVersion !== undefined ? Number(expectedVersion) : undefined,
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
    return this.entityService.getAuditLog(entityKey, id);
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Roll back an entity record to a previous version' })
  async rollback(
    @Param('entityKey') entityKey: string,
    @Param('id') id: string,
    @Body() body: { targetVersion: number; expectedVersion?: number },
  ) {
    try {
      return await this.entityService.rollback(
        entityKey,
        id,
        body.targetVersion,
        body.expectedVersion,
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
