import { Controller, DynamicModule, Module, Provider, Type, UseGuards } from '@nestjs/common';
import { CellBrandingController } from './cell-branding.controller.js';
import { CellBrandingRepository } from './cell-branding.repository.js';
import { CellBrandingService } from './cell-branding.service.js';
import {
  CELL_BRANDING_DATABASE,
  CELL_BRANDING_MODULE_OPTIONS,
  cellBrandingModuleOptionsSchema,
  type CellBrandingModuleOptions,
} from './cell-branding.tokens.js';

export type RegisterCellBrandingModuleOptions = Partial<CellBrandingModuleOptions> & {
  databaseProviderToken: CellBrandingModuleOptions['databaseProviderToken'];
  packageVersion: string;
  /**
   * Optional Nest guards applied to every branding route (GET/PATCH/POST).
   * Pass the host app's auth guard (e.g. JwtAuthGuard) to require auth on
   * writes. When omitted, routes are open (suitable for local dev only).
   */
  guards?: Type[];
};

function makeController(routePrefix: string, guards: readonly Type[] = []): Type {
  if (guards.length === 0) {
    @Controller(routePrefix)
    class RoutedCellBrandingController extends CellBrandingController {}
    return RoutedCellBrandingController as unknown as Type;
  }

  @Controller(routePrefix)
  @UseGuards(...guards)
  class GuardedCellBrandingController extends CellBrandingController {}
  return GuardedCellBrandingController as unknown as Type;
}

@Module({})
export class CellBrandingModule {
  static register(options: RegisterCellBrandingModuleOptions): DynamicModule {
    const resolved = cellBrandingModuleOptionsSchema.parse(options);

    const providers: Provider[] = [
      { provide: CELL_BRANDING_MODULE_OPTIONS, useValue: resolved },
      { provide: CELL_BRANDING_DATABASE, useExisting: resolved.databaseProviderToken },
      CellBrandingRepository,
      CellBrandingService,
    ];

    return {
      module: CellBrandingModule,
      controllers: [makeController(resolved.routePrefix, options.guards)],
      providers,
      exports: [CellBrandingRepository, CellBrandingService, CELL_BRANDING_MODULE_OPTIONS],
    };
  }
}
