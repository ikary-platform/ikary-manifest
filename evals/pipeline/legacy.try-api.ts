import { randomUUID } from 'node:crypto';
import { ManifestGeneratorService, PartialManifestAssembler, StandardValidationPipeline } from '@ikary/cell-ai/server';
import { PromptSanitizer, InputSizeGuard } from '@ikary/system-ai/server';
import type { EvalCase } from '../core/case-schema';
import type { EvalPipelineAdapter, EvalPipelineContext, EvalPipelineResult } from './types';
import { FixtureManifestTaskExecutor } from '../providers/fixture-manifest.executor';
import { createSystemAiTaskRunner, getPromptService } from './common';

export class LegacyTryApiPipeline implements EvalPipelineAdapter {
  readonly name = 'legacy.try-api';
  readonly description = 'Replay of the public try-api manifest generation service with coupled prompt assembly.';

  supports(testCase: EvalCase): string | null {
    return testCase.suite === 'clarification'
      ? 'legacy.try-api does not emit structured clarification questions.'
      : null;
  }

  async execute(task: Parameters<EvalPipelineAdapter['execute']>[0], context: EvalPipelineContext): Promise<EvalPipelineResult> {
    if (context.profile === 'fixture') {
      const executor = new FixtureManifestTaskExecutor({
        name: this.name,
        model: `fixture/${this.name}`,
      });
      const execution = await executor.execute({
        task,
        assumptions: [],
      });
      return validateLegacyResult(task, execution.manifest, {
        contextSummary: 'legacy try-api replay',
        assembledContext: buildLegacyPrompt(task),
        policyDecisions: ['Legacy try-api replay proceeded without structured clarification.'],
        provider: execution.aiResult?.provider,
        model: execution.aiResult?.model,
        inputTokens: execution.aiResult?.inputTokens,
        outputTokens: execution.aiResult?.outputTokens,
        rawResponse: execution.aiResult?.text,
      });
    }

    const promptService = await getPromptService(context.repoRoot);
    const service = new ManifestGeneratorService(
      createSystemAiTaskRunner(context.profile),
      new PromptSanitizer(),
      new InputSizeGuard(),
      new PartialManifestAssembler(),
      promptService,
    );

    const correlationId = randomUUID();
    let provider: string | undefined;
    let model: string | undefined;
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    let manifest: unknown;
    let error: string | undefined;

    for await (const event of service.streamManifest(
      {
        userPrompt: buildLegacyPrompt(task),
      },
      correlationId,
    )) {
      if (event.type === 'model-selected') {
        provider = event.provider;
        model = event.model;
      } else if (event.type === 'final-manifest') {
        manifest = event.manifest;
      } else if (event.type === 'done') {
        inputTokens = event.inputTokens;
        outputTokens = event.outputTokens;
        model = event.finalModel ?? model;
      } else if (event.type === 'error') {
        error = event.message;
      }
    }

    if (!manifest) {
      return {
        status: 'failed',
        error: error ?? 'legacy.try-api did not produce a manifest.',
        trace: {
          taskType: task.type,
          retrievalHits: [],
          contextSummary: 'legacy try-api replay',
          assembledContext: buildLegacyPrompt(task),
          policyDecisions: ['Legacy try-api replay proceeded without structured clarification.'],
          assumptions: [],
          provider,
          model,
          timingMs: 0,
          inputTokens,
          outputTokens,
          validation: [],
          diagnostics: error ? [error] : [],
          systemPrompt: '(embedded in ManifestGeneratorService)',
          rawResponse: undefined,
        },
      };
    }

    return validateLegacyResult(task, manifest, {
      contextSummary: 'legacy try-api replay',
      assembledContext: buildLegacyPrompt(task),
      policyDecisions: ['Legacy try-api replay proceeded without structured clarification.'],
      provider,
      model,
      inputTokens,
      outputTokens,
      rawResponse: JSON.stringify(manifest),
    });
  }
}

function buildLegacyPrompt(task: { type: string; prompt: string; manifest?: unknown }): string {
  switch (task.type) {
    case 'create':
      return task.prompt;
    case 'fix':
      return [
        'Repair the attached IKARY manifest and preserve existing intent.',
        `Request: ${task.prompt}`,
        `Manifest:\n${JSON.stringify(task.manifest, null, 2)}`,
      ].join('\n\n');
    case 'update':
      return [
        'Update the attached IKARY manifest.',
        `Request: ${task.prompt}`,
        `Manifest:\n${JSON.stringify(task.manifest, null, 2)}`,
      ].join('\n\n');
    default:
      return task.prompt;
  }
}

function validateLegacyResult(
  task: { type: 'create' | 'fix' | 'update' },
  manifest: unknown,
  traceSeed: {
    contextSummary: string;
    assembledContext: string;
    policyDecisions: string[];
    provider?: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    rawResponse?: string;
  },
): EvalPipelineResult {
  const validation = new StandardValidationPipeline();
  return validation.validate({ manifest }).then((result) => (
    result.valid
      ? {
          status: 'completed',
          manifest,
          trace: {
            taskType: task.type,
            retrievalHits: [],
            contextSummary: traceSeed.contextSummary,
            assembledContext: traceSeed.assembledContext,
            policyDecisions: traceSeed.policyDecisions,
            assumptions: [],
            provider: traceSeed.provider,
            model: traceSeed.model,
            timingMs: 0,
            inputTokens: traceSeed.inputTokens,
            outputTokens: traceSeed.outputTokens,
            validation: result.stages,
            candidateManifest: manifest,
            compiledManifest: result.compiledManifest,
            diagnostics: [],
            systemPrompt: '(embedded in ManifestGeneratorService)',
            rawResponse: traceSeed.rawResponse,
          },
        }
      : {
          status: 'failed',
          error: 'Manifest validation failed.',
          trace: {
            taskType: task.type,
            retrievalHits: [],
            contextSummary: traceSeed.contextSummary,
            assembledContext: traceSeed.assembledContext,
            policyDecisions: traceSeed.policyDecisions,
            assumptions: [],
            provider: traceSeed.provider,
            model: traceSeed.model,
            timingMs: 0,
            inputTokens: traceSeed.inputTokens,
            outputTokens: traceSeed.outputTokens,
            validation: result.stages,
            candidateManifest: manifest,
            compiledManifest: result.compiledManifest,
            diagnostics: ['Manifest validation failed.'],
            systemPrompt: '(embedded in ManifestGeneratorService)',
            rawResponse: traceSeed.rawResponse,
          },
        }
  ));
}
