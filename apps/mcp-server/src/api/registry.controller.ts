import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RegistryService } from '../services/registry.service';

@ApiTags('primitives')
@Controller('api/primitives')
export class RegistryPrimitivesController {
  constructor(private readonly registry: RegistryService) {}

  @Get()
  @ApiOperation({ summary: 'List UI primitives', description: 'Returns the catalog of 30 IKARY UI primitives with categories and descriptions.' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (collection, input, form, layout, page, display, feedback)' })
  listPrimitives(@Query('category') category?: string) {
    return this.registry.listPrimitives({ category });
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get primitive contract', description: 'Returns the presentation contract for one UI primitive.' })
  @ApiParam({ name: 'key', description: 'Primitive key (e.g., "data-grid", "form")' })
  getPrimitiveContract(@Param('key') key: string) {
    return this.registry.getPrimitiveContract(key);
  }
}

@ApiTags('examples')
@Controller('api/examples')
export class RegistryExamplesController {
  constructor(private readonly registry: RegistryService) {}

  @Get()
  @ApiOperation({ summary: 'List example manifests', description: 'Returns available sample manifests from the IKARY examples catalog.' })
  listExamples() {
    return this.registry.listExamples();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get example manifest', description: 'Returns the full content of one example manifest.' })
  @ApiParam({ name: 'key', description: 'Example key (e.g., "crm-manifest", "minimal-manifest")' })
  getExampleManifest(@Param('key') key: string) {
    return this.registry.getExampleManifest(key);
  }
}
