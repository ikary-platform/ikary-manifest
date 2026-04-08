import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ValidationService } from '../services/validation.service';

@ApiTags('validation')
@Controller('api/validate')
export class ValidationController {
  constructor(private readonly validation: ValidationService) {}

  @Post('manifest')
  @ApiOperation({ summary: 'Validate a manifest', description: 'Full structural + semantic validation of a CellManifestV1 JSON.' })
  @ApiBody({ schema: { type: 'object', properties: { manifest: { type: 'object' } }, required: ['manifest'] } })
  validateManifest(@Body() body: { manifest: unknown }) {
    return this.validation.validateManifest(body.manifest);
  }

  @Post('entity')
  @ApiOperation({ summary: 'Validate an entity', description: 'Validates a single EntityDefinition in isolation (structural + semantic).' })
  @ApiBody({ schema: { type: 'object', properties: { entity: { type: 'object' } }, required: ['entity'] } })
  validateEntity(@Body() body: { entity: unknown }) {
    return this.validation.validateEntity(body.entity);
  }

  @Post('page')
  @ApiOperation({ summary: 'Validate a page', description: 'Validates a single PageDefinition against the schema.' })
  @ApiBody({ schema: { type: 'object', properties: { page: { type: 'object' } }, required: ['page'] } })
  validatePage(@Body() body: { page: unknown }) {
    return this.validation.validatePage(body.page);
  }

  @Post('normalize')
  @ApiOperation({ summary: 'Normalize a manifest', description: 'Compiles and normalizes a manifest: validates, fills defaults, resolves omitted arrays. Returns the normalized manifest if valid.' })
  @ApiBody({ schema: { type: 'object', properties: { manifest: { type: 'object' } }, required: ['manifest'] } })
  normalizeManifest(@Body() body: { manifest: unknown }) {
    return this.validation.normalizeManifest(body.manifest);
  }
}
