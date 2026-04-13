import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { JsonSchemaService } from '../services/json-schema.service';

@ApiTags('json-schema')
@Controller('api/json-schema')
export class JsonSchemaController {
  constructor(private readonly schemas: JsonSchemaService) {}

  @Get()
  @ApiOperation({ summary: 'List available JSON Schema endpoints' })
  list() {
    return this.schemas.listSchemas();
  }

  @Get('manifest')
  @ApiOperation({
    summary: 'JSON Schema (Draft-07) for CellManifestV1',
    description:
      'Machine-consumable JSON Schema for the full Cell manifest. ' +
      'Paste this URL into VS Code json.schemas or Monaco setDiagnosticsOptions for instant IntelliSense.',
  })
  @ApiProduces('application/schema+json')
  @Header('Content-Type', 'application/schema+json')
  manifest() {
    return this.schemas.getManifestSchema();
  }

  @Get('entity')
  @ApiOperation({
    summary: 'JSON Schema (Draft-07) for EntityDefinition',
    description: 'Machine-consumable JSON Schema for an entity definition (fields, relations, lifecycle, …).',
  })
  @ApiProduces('application/schema+json')
  @Header('Content-Type', 'application/schema+json')
  entity() {
    return this.schemas.getEntitySchema();
  }

  @Get('primitive/:key')
  @ApiOperation({
    summary: 'JSON Schema (Draft-07) for a primitive\'s contract props',
    description:
      'Returns a JSON Schema for the contract props of the given primitive key. ' +
      'Core primitives without a typed contract return a permissive { type: "object" } schema.',
  })
  @ApiProduces('application/schema+json')
  @Header('Content-Type', 'application/schema+json')
  primitive(@Param('key') key: string) {
    return this.schemas.getPrimitiveSchema(key);
  }
}
