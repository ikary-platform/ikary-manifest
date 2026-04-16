import { describe, expect, it } from 'vitest';
import { manifestTaskInputSchema } from '../../shared/pipeline.schema';
import { ModularManifestPipeline } from './modular-manifest.pipeline';

describe('ModularManifestPipeline', () => {
  it('returns structured clarification requests when the policy asks', async () => {
    const pipeline = new ModularManifestPipeline(
      { name: 'knowledge', retrieve: async () => [] },
      {
        name: 'context',
        assemble: async () => ({
          summary: 'summary',
          promptContext: 'prompt-context',
          assumptions: [],
          items: [],
        }),
      },
      {
        name: 'clarification',
        decide: async () => ({
          kind: 'ask',
          assumptions: [],
          policySummary: 'needs clarification',
          questions: [
            {
              id: 'scope-depth',
              question: 'How detailed should the manifest be?',
              reason: 'Prompt is short.',
              options: ['minimal', 'standard', 'extended'],
            },
          ],
        }),
      },
      {
        name: 'executor',
        execute: async () => ({ manifest: { ignored: true } }),
      },
      {
        name: 'validation',
        validate: async () => ({ valid: true, stages: [], compiledManifest: {} }),
      },
    );

    const result = await pipeline.execute(manifestTaskInputSchema.parse({
      type: 'create',
      prompt: 'CRM',
      clarificationMode: 'enabled',
    }));

    expect(result.status).toBe('needs_clarification');
    if (result.status !== 'needs_clarification') {
      throw new Error('Expected structured clarification result.');
    }
    expect(result.questions[0]?.id).toBe('scope-depth');
  });

  it('returns completed results when execution and validation succeed', async () => {
    const manifest = { apiVersion: 'ikary.co/v1alpha1', kind: 'Cell' };
    const pipeline = new ModularManifestPipeline(
      { name: 'knowledge', retrieve: async () => [] },
      {
        name: 'context',
        assemble: async () => ({
          summary: 'summary',
          promptContext: 'prompt-context',
          assumptions: ['default assumption'],
          items: [],
        }),
      },
      {
        name: 'clarification',
        decide: async () => ({
          kind: 'proceed',
          assumptions: [],
          policySummary: 'proceed',
        }),
      },
      {
        name: 'executor',
        execute: async () => ({
          manifest,
          aiResult: {
            text: JSON.stringify(manifest),
            structured: manifest,
            provider: 'fixture',
            model: 'fixture/test',
            inputTokens: 10,
            outputTokens: 20,
            latencyMs: 5,
            trace: {
              correlationId: 'corr-1',
              taskId: 'manifest.create',
              profile: 'fixture',
              startedAt: new Date(0).toISOString(),
              completedAt: new Date(0).toISOString(),
              attempts: [],
            },
          },
        }),
      },
      {
        name: 'validation',
        validate: async () => ({
          valid: true,
          stages: [
            { stage: 'parse', passed: true, errors: [] },
            { stage: 'schema', passed: true, errors: [] },
          ],
          compiledManifest: { ok: true },
        }),
      },
    );

    const result = await pipeline.execute(manifestTaskInputSchema.parse({
      type: 'create',
      prompt: 'Build a task tracker',
      clarificationMode: 'disabled',
    }));

    expect(result.status).toBe('completed');
    expect(result.assumptions).toContain('default assumption');
    expect(result.trace.validation).toHaveLength(2);
  });
});
