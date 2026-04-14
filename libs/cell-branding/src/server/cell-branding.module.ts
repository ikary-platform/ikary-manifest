import { Controller, DynamicModule, Module, Provider, Type } from '@nestjs/common';
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
};

function makeController(routePrefix: string): Type {
  @Controller(routePrefix)
  class RoutedCellBrandingController extends CellBrandingController {}
  return RoutedCellBrandingController as unknown as Type;
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
      controllers: [makeController(resolved.routePrefix)],
      providers,
      exports: [CellBrandingRepository, CellBrandingService, CELL_BRANDING_MODULE_OPTIONS],
    };
  }
}
