import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post } from '@nestjs/common';
import { CellBrandingService } from './cell-branding.service.js';

@Controller()
export class CellBrandingController {
  constructor(
    @Inject(CellBrandingService)
    private readonly service: CellBrandingService,
  ) {}

  @Get(':cellId/branding')
  async get(@Param('cellId') cellId: string) {
    const data = await this.service.getBranding(cellId);
    return { data };
  }

  @Patch(':cellId/branding')
  async upsert(@Param('cellId') cellId: string, @Body() body: unknown) {
    const data = await this.service.upsertBranding(cellId, body);
    return { data };
  }

  @Post(':cellId/branding/reset')
  @HttpCode(200)
  async reset(@Param('cellId') cellId: string, @Body() body: unknown) {
    const data = await this.service.resetBranding(cellId, body);
    return { data };
  }
}
