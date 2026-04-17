import type { AiTaskRunResult } from '@ikary/system-ai';
import type {
  ClarifyingQuestion,
  ContextAssembly,
  EvalExecutionResult,
  ExecutionTrace,
  KnowledgeItem,
  ManifestTaskInput,
  ValidationStageResult,
} from '../../shared/pipeline.schema';

export interface KnowledgeProvider {
  readonly name: string;
  retrieve(input: ManifestTaskInput): Promise<KnowledgeItem[]>;
}

export interface ContextAssembler {
  readonly name: string;
  assemble(input: {
    task: ManifestTaskInput;
    retrieved: KnowledgeItem[];
  }): Promise<ContextAssembly>;
}

export type ClarificationDecision =
  | {
      kind: 'proceed';
      assumptions: string[];
      policySummary: string;
    }
  | {
      kind: 'ask';
      assumptions: string[];
      questions: ClarifyingQuestion[];
      policySummary: string;
    }
  | {
      kind: 'fail';
      assumptions: string[];
      error: string;
      policySummary: string;
    };

export interface ClarificationPolicy {
  readonly name: string;
  decide(input: {
    task: ManifestTaskInput;
    context: ContextAssembly;
    retrieved: KnowledgeItem[];
  }): Promise<ClarificationDecision>;
}

export interface ManifestExecutorResult {
  readonly manifest?: unknown;
  readonly error?: string;
  readonly aiResult?: AiTaskRunResult<unknown>;
  readonly systemPrompt?: string;
}

export interface ManifestTaskExecutor {
  readonly name: string;
  execute(input: {
    task: ManifestTaskInput;
    context: ContextAssembly;
    retrieved: KnowledgeItem[];
    assumptions: string[];
  }): Promise<ManifestExecutorResult>;
}

export interface ValidationPipelineResult {
  readonly valid: boolean;
  readonly stages: ValidationStageResult[];
  readonly compiledManifest?: unknown;
}

export interface ValidationPipeline {
  readonly name: string;
  validate(input: {
    task: ManifestTaskInput;
    manifest: unknown;
  }): Promise<ValidationPipelineResult>;
}

export interface ManifestPipeline {
  execute(input: ManifestTaskInput): Promise<EvalExecutionResult>;
}
