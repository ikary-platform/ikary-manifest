import { Injectable } from '@nestjs/common';
import type { ManifestPipeline } from './interfaces';
import type { EvalExecutionResult, ExecutionTrace, ManifestTaskInput } from '../../shared/pipeline.schema';
import type {
  ClarificationPolicy,
  ContextAssembler,
  KnowledgeProvider,
  ManifestTaskExecutor,
  ValidationPipeline,
} from './interfaces';

@Injectable()
export class ModularManifestPipeline implements ManifestPipeline {
  constructor(
    private readonly knowledgeProvider: KnowledgeProvider,
    private readonly contextAssembler: ContextAssembler,
    private readonly clarificationPolicy: ClarificationPolicy,
    private readonly executor: ManifestTaskExecutor,
    private readonly validationPipeline: ValidationPipeline,
  ) {}

  async execute(input: ManifestTaskInput): Promise<EvalExecutionResult> {
    const startedAt = Date.now();
    const retrieved = await this.knowledgeProvider.retrieve(input);
    const context = await this.contextAssembler.assemble({ task: input, retrieved });
    const clarification = await this.clarificationPolicy.decide({
      task: input,
      context,
      retrieved,
    });

    const assumptions = [...context.assumptions, ...clarification.assumptions];
    const baseTrace: ExecutionTrace = {
      taskType: input.type,
      retrievalHits: retrieved,
      contextSummary: context.summary,
      assembledContext: context.promptContext,
      policyDecisions: [clarification.policySummary],
      assumptions,
      timingMs: Date.now() - startedAt,
      validation: [],
      candidateManifest: input.manifest,
      diagnostics: [],
    };

    if (clarification.kind === 'fail') {
      return {
        status: 'failed',
        error: clarification.error,
        assumptions,
        trace: {
          ...baseTrace,
          diagnostics: [clarification.error],
        },
      };
    }

    if (clarification.kind === 'ask') {
      return {
        status: 'needs_clarification',
        questions: clarification.questions,
        assumptions,
        trace: baseTrace,
      };
    }

    const execution = await this.executor.execute({
      task: input,
      context,
      retrieved,
      assumptions,
    });

    if (!execution.manifest) {
      return {
        status: 'failed',
        error: execution.error ?? 'Manifest executor did not return a manifest.',
        assumptions,
        trace: {
          ...baseTrace,
          provider: execution.aiResult?.provider,
          model: execution.aiResult?.model,
          inputTokens: execution.aiResult?.inputTokens,
          outputTokens: execution.aiResult?.outputTokens,
          candidateManifest: execution.aiResult?.structured ?? execution.aiResult?.text,
          diagnostics: execution.error ? [execution.error] : [],
        },
      };
    }

    const validation = await this.validationPipeline.validate({
      task: input,
      manifest: execution.manifest,
    });

    if (!validation.valid) {
      return {
        status: 'failed',
        error: 'Manifest validation failed.',
        assumptions,
        trace: {
          ...baseTrace,
          provider: execution.aiResult?.provider,
          model: execution.aiResult?.model,
          inputTokens: execution.aiResult?.inputTokens,
          outputTokens: execution.aiResult?.outputTokens,
          validation: validation.stages,
          candidateManifest: execution.manifest,
          compiledManifest: validation.compiledManifest,
          diagnostics: ['Manifest validation failed.'],
        },
      };
    }

    return {
      status: 'completed',
      manifest: execution.manifest,
      assumptions,
      trace: {
        ...baseTrace,
        provider: execution.aiResult?.provider,
        model: execution.aiResult?.model,
        inputTokens: execution.aiResult?.inputTokens,
        outputTokens: execution.aiResult?.outputTokens,
        validation: validation.stages,
        candidateManifest: execution.manifest,
        compiledManifest: validation.compiledManifest,
      },
    };
  }
}
