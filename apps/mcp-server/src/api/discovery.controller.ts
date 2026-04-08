import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DiscoveryService } from '../services/discovery.service';

@ApiTags('schemas')
@Controller('api/schemas')
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get('manifest')
  @ApiOperation({ summary: 'Get the CellManifestV1 schema', description: 'Returns the canonical top-level manifest structure with fields, types, and semantic rules.' })
  @ApiQuery({ name: 'version', required: false, description: 'Schema version (default: latest)' })
  getManifestSchema(@Query('version') version?: string) {
    return this.discovery.getManifestSchema(version);
  }

  @Get('entity')
  @ApiOperation({ summary: 'Get the EntityDefinition schema', description: 'Returns the entity definition contract with fields, nested structures, and semantic rules.' })
  @ApiQuery({ name: 'version', required: false, description: 'Schema version (default: latest)' })
  getEntitySchema(@Query('version') version?: string) {
    return this.discovery.getEntitySchema(version);
  }

  @Get('page')
  @ApiOperation({ summary: 'Get the PageDefinition schema', description: 'Returns allowed page types and their contracts. Optionally filter by page type.' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by page type (entity-list, entity-detail, entity-create, entity-edit, dashboard, custom)' })
  getPageSchema(@Query('type') pageType?: string) {
    return this.discovery.getPageSchema(pageType);
  }

  @Get('capability')
  @ApiOperation({ summary: 'Get the CapabilityDefinition schema', description: 'Returns the capability definition contract. Optionally filter by type.' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by capability type (transition, mutation, workflow, export, integration)' })
  getCapabilitySchema(@Query('type') capabilityType?: string) {
    return this.discovery.getCapabilitySchema(capabilityType);
  }
}
