import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildManifestTaskInput } from '../core/task-input';
import minimalCrmClarificationCase from '../cases/clarification/minimal-crm.case';
import { RefactoredDefaultPipeline } from '../pipeline/refactored.default';

describe('clarification flow', () => {
  it('asks first and then completes after answers in fixture mode', async () => {
    const pipeline = new RefactoredDefaultPipeline();
    const context = {
      repoRoot: resolve(process.cwd()),
      profile: 'fixture',
      clarificationMode: 'enabled' as const,
      runtimeMode: 'compile-only' as const,
    };

    const initial = await pipeline.execute(
      buildManifestTaskInput(minimalCrmClarificationCase, 'enabled'),
      context,
    );
    expect(initial.status).toBe('needs_clarification');

    const resumed = await pipeline.execute(
      buildManifestTaskInput(
        minimalCrmClarificationCase,
        'enabled',
        minimalCrmClarificationCase.input.clarificationAnswers,
      ),
      context,
    );

    expect(resumed.status).toBe('completed');
  });
});
