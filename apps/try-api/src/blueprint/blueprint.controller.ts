import { Controller, Get, Inject, Param } from '@nestjs/common';
import { BlueprintLoaderService } from '@ikary/cell-ai/server';
import type { BlueprintMetadata } from '@ikary/cell-ai';

@Controller('blueprints')
export class BlueprintController {
  constructor(
    @Inject(BlueprintLoaderService) private readonly loader: BlueprintLoaderService,
  ) {}

  @Get()
  async list(): Promise<{ items: BlueprintMetadata[] }> {
    const items = await this.loader.list();
    return { items: items.map((b) => ({ ...b, source: '' })) };
  }

  @Get(':category/:name')
  async detail(
    @Param('category') category: string,
    @Param('name') name: string,
  ): Promise<{ manifest: unknown }> {
    const manifest = await this.loader.load(`${category}/${name}`);
    return { manifest };
  }
}
