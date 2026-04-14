import { DynamicModule, Module } from '@nestjs/common';
import { ManifestGeneratorService } from './manifest-generator.service';
import { PartialManifestAssembler } from './partial-manifest-assembler';
import { BlueprintLoaderService, type BlueprintLoaderOptions } from './blueprint-loader.service';

export interface CellAiModuleOptions {
  blueprints: BlueprintLoaderOptions;
}

@Module({})
export class CellAiModule {
  static forRoot(options: CellAiModuleOptions): DynamicModule {
    const blueprintsProvider = {
      provide: BlueprintLoaderService,
      useFactory: () => new BlueprintLoaderService(options.blueprints),
    };
    return {
      module: CellAiModule,
      global: true,
      providers: [PartialManifestAssembler, ManifestGeneratorService, blueprintsProvider],
      exports: [PartialManifestAssembler, ManifestGeneratorService, BlueprintLoaderService],
    };
  }
}
