import type {
  ClarificationMode,
  EvalExecutionResult,
  ManifestTaskInput,
} from '@ikary/cell-ai';
import type { EvalCase, EvalSuite } from '../core/case-schema';

export interface EvalPipelineContext {
  readonly repoRoot: string;
  readonly profile: string;
  readonly clarificationMode: ClarificationMode;
  readonly runtimeMode: 'compile-only' | 'preview';
}

export interface EvalSkippedResult {
  readonly status: 'skipped';
  readonly reason: string;
  readonly trace?: Record<string, unknown>;
}

export type EvalPipelineResult = EvalExecutionResult | EvalSkippedResult;

export interface EvalPipelineAdapter {
  readonly name: string;
  readonly description: string;
  readonly supportedSuites?: EvalSuite[];
  readonly supportedTaskTypes?: Array<ManifestTaskInput['type']>;
  supports(testCase: EvalCase): string | null;
  execute(task: ManifestTaskInput, context: EvalPipelineContext): Promise<EvalPipelineResult>;
}

export interface EvalRunArtifact {
  readonly initialResult: EvalPipelineResult;
  readonly resumedResult?: EvalPipelineResult;
  readonly finalResult: EvalPipelineResult;
}
