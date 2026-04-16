import { DynamicModule, Module } from '@nestjs/common';
import { ManifestGeneratorService } from './manifest-generator.service';
import { PartialManifestAssembler } from './partial-manifest-assembler';
import { BlueprintLoaderService, type BlueprintLoaderOptions } from './blueprint-loader.service';
import { DefaultKnowledgeProvider } from './pipeline/default-knowledge.provider';
import { DefaultContextAssembler } from './pipeline/default-context.assembler';
import { HeuristicClarificationPolicy } from './pipeline/heuristic-clarification.policy';
import { SystemAiManifestTaskExecutor } from './pipeline/system-ai-manifest-task.executor';
import { StandardValidationPipeline } from './pipeline/standard-validation.pipeline';

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
      providers: [
        PartialManifestAssembler,
        ManifestGeneratorService,
        DefaultKnowledgeProvider,
        DefaultContextAssembler,
        HeuristicClarificationPolicy,
        SystemAiManifestTaskExecutor,
        StandardValidationPipeline,
        blueprintsProvider,
      ],
      exports: [
        PartialManifestAssembler,
        ManifestGeneratorService,
        BlueprintLoaderService,
        DefaultKnowledgeProvider,
        DefaultContextAssembler,
        HeuristicClarificationPolicy,
        SystemAiManifestTaskExecutor,
        StandardValidationPipeline,
      ],
    };
  }
}
