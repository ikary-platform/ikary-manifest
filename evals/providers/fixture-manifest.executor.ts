import type { ManifestTaskExecutor, ManifestExecutorResult } from '@ikary/cell-ai/server';
import type { ManifestTaskInput } from '@ikary/cell-ai';
import type { AiTaskRunResult } from '@ikary/system-ai';
import {
  crmContactsManifest,
  taskTrackerManifest,
  updatedNotesWithCategoryManifest,
} from '../fixtures/manifests';

export interface FixtureManifestTaskExecutorOptions {
  readonly name: string;
  readonly provider?: string;
  readonly model?: string;
}

export class FixtureManifestTaskExecutor implements ManifestTaskExecutor {
  readonly name: string;
  private readonly provider: string;
  private readonly model: string;

  constructor(options: FixtureManifestTaskExecutorOptions) {
    this.name = options.name;
    this.provider = options.provider ?? 'fixture';
    this.model = options.model ?? `fixture/${options.name}`;
  }

  async execute(input: {
    task: ManifestTaskInput;
    assumptions: string[];
  }): Promise<ManifestExecutorResult> {
    const manifest = resolveFixtureManifest(input.task);
    const aiResult: AiTaskRunResult<unknown> = {
      text: JSON.stringify(manifest),
      structured: manifest,
      provider: this.provider,
      model: this.model,
      inputTokens: Math.ceil(input.task.prompt.length / 4),
      outputTokens: Math.ceil(JSON.stringify(manifest).length / 4),
      latencyMs: 1,
      trace: {
        correlationId: `fixture-${String(input.task.metadata.caseId ?? input.task.type)}`,
        taskId: `fixture.${input.task.type}`,
        profile: 'fixture',
        startedAt: new Date(0).toISOString(),
        completedAt: new Date(0).toISOString(),
        metadata: input.task.metadata,
        attempts: [
          {
            attempt: 1,
            provider: this.provider,
            configuredModel: this.model,
            resolvedModel: this.model,
            status: 'succeeded',
            latencyMs: 1,
            inputTokens: Math.ceil(input.task.prompt.length / 4),
            outputTokens: Math.ceil(JSON.stringify(manifest).length / 4),
          },
        ],
      },
    };

    return {
      manifest,
      aiResult,
    };
  }
}

export function resolveFixtureManifest(task: ManifestTaskInput): Record<string, unknown> {
  const caseId = String(task.metadata.caseId ?? '');
  switch (caseId) {
    case 'create.task-tracker':
    case 'fix.restore-task-entity':
    case 'retrieval.task-tracker':
    case 'context.task-tracker':
    case 'e2e.task-tracker':
      return structuredClone(taskTrackerManifest);
    case 'update.notes-add-category':
      return structuredClone(updatedNotesWithCategoryManifest);
    case 'clarification.minimal-crm':
      return structuredClone(crmContactsManifest);
    default:
      return guessFixtureManifest(task);
  }
}

function guessFixtureManifest(task: ManifestTaskInput): Record<string, unknown> {
  const normalized = task.prompt.toLowerCase();
  if (normalized.includes('crm') || normalized.includes('contact')) {
    return structuredClone(crmContactsManifest);
  }
  if (normalized.includes('note') || normalized.includes('category')) {
    return structuredClone(updatedNotesWithCategoryManifest);
  }
  return structuredClone(taskTrackerManifest);
}
