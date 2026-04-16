import { resolve } from 'node:path';
import {
  BlueprintLoaderService,
  DefaultContextAssembler,
  DefaultKnowledgeProvider,
  HeuristicClarificationPolicy,
  ModularManifestPipeline,
  StandardValidationPipeline,
  type ClarificationPolicy,
  type ContextAssembler,
  type KnowledgeProvider,
  type ManifestTaskExecutor,
} from '@ikary/cell-ai/server';
import {
  AiTaskRunner,
  InputSizeGuard,
  PromptSanitizer,
  ProviderRouter,
  buildAiRuntimeConfigFromEnv,
} from '@ikary/system-ai/server';
import { PromptRegistry } from '@ikary/system-prompt';
import { PromptRegistryService, loadPromptFiles } from '@ikary/system-prompt/server';
import type { EvalPipelineContext } from './types';
import { FixtureManifestTaskExecutor } from '../providers/fixture-manifest.executor';
import { EvalSystemAiManifestTaskExecutor } from './system-ai-manifest-task.executor';

let cachedRegistry: Promise<PromptRegistry> | null = null;
let cachedPromptService: Promise<PromptRegistryService> | null = null;

export function getPromptRegistry(repoRoot: string): Promise<PromptRegistry> {
  if (!cachedRegistry) {
    cachedRegistry = loadPromptFiles(resolve(repoRoot, 'prompts')).then(
      (files) => new PromptRegistry(files),
    );
  }
  return cachedRegistry;
}

export function getPromptService(repoRoot: string): Promise<PromptRegistryService> {
  if (!cachedPromptService) {
    const sanitizer = new PromptSanitizer();
    const sizeGuard = new InputSizeGuard();
    const service = new PromptRegistryService(
      { promptsDir: resolve(repoRoot, 'prompts') },
      sanitizer,
      sizeGuard,
    );
    cachedPromptService = service.onModuleInit().then(() => service);
  }
  return cachedPromptService;
}

export function createBlueprintLoader(repoRoot: string): BlueprintLoaderService {
  return new BlueprintLoaderService({
    examplesDir: resolve(repoRoot, 'manifests', 'examples'),
  });
}

export function createSystemAiTaskRunner(profile: string): AiTaskRunner {
  const config = buildAiRuntimeConfigFromEnv({
    ...process.env,
    AI_PROFILE: profile,
  });
  return new AiTaskRunner(new ProviderRouter(config));
}

export async function createDefaultModularPipeline(
  context: EvalPipelineContext,
  options?: {
    knowledgeProvider?: KnowledgeProvider;
    contextAssembler?: ContextAssembler;
    clarificationPolicy?: ClarificationPolicy;
    executor?: ManifestTaskExecutor;
  },
): Promise<ModularManifestPipeline> {
  const blueprintLoader = createBlueprintLoader(context.repoRoot);
  const knowledgeProvider = options?.knowledgeProvider ?? new DefaultKnowledgeProvider(blueprintLoader);
  const contextAssembler = options?.contextAssembler ?? new DefaultContextAssembler();
  const clarificationPolicy = options?.clarificationPolicy ?? new HeuristicClarificationPolicy();
  const executor = options?.executor ?? (await createManifestExecutor(context, 'refactored.default'));

  return new ModularManifestPipeline(
    knowledgeProvider,
    contextAssembler,
    clarificationPolicy,
    executor,
    new StandardValidationPipeline(),
  );
}

export async function createManifestExecutor(
  context: EvalPipelineContext,
  label: string,
): Promise<ManifestTaskExecutor> {
  if (context.profile === 'fixture') {
    return new FixtureManifestTaskExecutor({
      name: label,
      provider: 'fixture',
      model: `fixture/${label}`,
    });
  }

  const registry = await getPromptRegistry(context.repoRoot);
  return new EvalSystemAiManifestTaskExecutor(createSystemAiTaskRunner(context.profile), registry);
}
