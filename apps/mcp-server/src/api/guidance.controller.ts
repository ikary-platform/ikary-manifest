import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { GuidanceService } from '../services/guidance.service';

@ApiTags('guidance')
@Controller('api/guidance')
export class GuidanceController {
  constructor(private readonly guidance: GuidanceService) {}

  @Post('recommend')
  @ApiOperation({ summary: 'Recommend manifest structure', description: 'Takes a business goal and recommends entities, pages, relations, and navigation.' })
  @ApiBody({ schema: { type: 'object', properties: { goal: { type: 'string', example: 'I need a simple CRM with companies and contacts' } }, required: ['goal'] } })
  recommend(@Body() body: { goal: string }) {
    return this.guidance.recommendStructure(body.goal);
  }

  @Post('suggest-pages')
  @ApiOperation({ summary: 'Suggest CRUD page set', description: 'Generates standard pages (list, detail, create) for given entities plus dashboard and navigation.' })
  @ApiBody({ schema: { type: 'object', properties: { entities: { type: 'array', items: { type: 'string' }, example: ['customer', 'order'] } }, required: ['entities'] } })
  suggestPages(@Body() body: { entities: string[] }) {
    return this.guidance.suggestPages(body.entities);
  }

  @Post('suggest-relations')
  @ApiOperation({ summary: 'Suggest entity relations', description: 'Analyzes entities and suggests relations based on naming patterns and domain knowledge.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        entities: {
          type: 'array',
          items: { type: 'object', properties: { key: { type: 'string' }, fields: { type: 'array', items: { type: 'string' } } }, required: ['key'] },
          example: [{ key: 'order', fields: ['customer_id', 'total'] }, { key: 'customer' }],
        },
      },
      required: ['entities'],
    },
  })
  suggestRelations(@Body() body: { entities: Array<{ key: string; fields?: string[] }> }) {
    return this.guidance.suggestRelations(body.entities);
  }

  @Post('explain-errors')
  @ApiOperation({ summary: 'Explain validation errors', description: 'Turns raw validation errors into actionable explanations with fix suggestions.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } }, required: ['field', 'message'] },
          example: [{ field: 'spec.entities', message: 'entity keys must be unique' }],
        },
      },
      required: ['errors'],
    },
  })
  explainErrors(@Body() body: { errors: Array<{ field: string; message: string }> }) {
    return this.guidance.explainErrors(body.errors);
  }
}
