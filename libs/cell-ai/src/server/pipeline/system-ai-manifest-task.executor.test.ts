import { describe, expect, it, vi } from 'vitest';
import { SystemAiManifestTaskExecutor } from './system-ai-manifest-task.executor';
import type { ManifestTaskInput } from '../../shared/pipeline.schema';

const validManifest = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'task_tracker', name: 'Tasks', version: '1.0.0' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      { key: 'task', name: 'Task', pluralName: 'Tasks', fields: [{ key: 'title', name: 'Title', type: 'string' }] },
    ],
  },
};

function makeRunner(responses: unknown[]) {
  let i = 0;
  return {
    runTask: vi.fn(async () => {
      const next = responses[i++] ?? validManifest;
      return {
        text: JSON.stringify(next),
        structured: next,
        provider: 'fake',
        model: 'fake-model',
        inputTokens: 10,
        outputTokens: 20,
        latencyMs: 1,
        trace: {
          correlationId: 'c',
          taskId: 'manifest.create',
          profile: 'eval',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          attempts: [
            {
              attempt: 1,
              provider: 'fake',
              configuredModel: 'fake-model',
              status: 'succeeded' as const,
              latencyMs: 1,
              inputTokens: 10,
              outputTokens: 20,
            },
          ],
        },
      };
    }),
  } as unknown as ConstructorParameters<typeof SystemAiManifestTaskExecutor>[0];
}

function makePrompts() {
  return {
    render: vi.fn((name: string, args: Record<string, unknown>) =>
      `system:${name}:${(args.task_type as string) ?? 'unknown'}`),
  } as unknown as ConstructorParameters<typeof SystemAiManifestTaskExecutor>[1];
}

function makeMcp(opts: {
  validate?: ((manifest: unknown) => Promise<{ valid: boolean; errors: { field: string; message: string }[] }>) | null;
  schemaText?: string;
}) {
  return {
    getManifestSchemaText: vi.fn(async () => opts.schemaText ?? 'SCHEMA: stuff'),
    validateManifest: opts.validate
      ? vi.fn(opts.validate)
      : vi.fn(async () => ({ valid: true, errors: [] })),
    explainErrors: vi.fn(async (errors: { field: string; message: string }[]) => ({
      guidance: errors.map((e) => ({ field: e.field, message: e.message, suggestion: 'add it' })),
    })),
  } as unknown as ConstructorParameters<typeof SystemAiManifestTaskExecutor>[2];
}

const baseInput: { task: ManifestTaskInput; context: { promptContext: string } } = {
  task: {
    type: 'create',
    prompt: 'task tracker',
    clarificationMode: 'disabled',
    clarificationAnswers: {},
    metadata: {},
  },
  context: { promptContext: 'Build a task tracker' },
};

describe('SystemAiManifestTaskExecutor validate-and-fix loop', () => {
  it('returns the manifest immediately when MCP validates the first generation', async () => {
    process.env.MANIFEST_VALIDATION_MAX_FIX_ATTEMPTS = '2';
    const runner = makeRunner([validManifest]);
    const prompts = makePrompts();
    const mcp = makeMcp({});
    const executor = new SystemAiManifestTaskExecutor(runner as never, prompts as never, mcp as never);

    const result = await executor.execute(baseInput);

    expect(result.manifest).toEqual(validManifest);
    expect(result.error).toBeUndefined();
    expect((runner as unknown as { runTask: { mock: { calls: unknown[][] } } }).runTask.mock.calls).toHaveLength(1);
  });

  it('runs a fix turn when MCP rejects the first manifest, then returns when the fix succeeds', async () => {
    process.env.MANIFEST_VALIDATION_MAX_FIX_ATTEMPTS = '2';
    const runner = makeRunner([
      { apiVersion: 'wrong', kind: 'Cell', metadata: { key: 'x', name: 'X', version: '1.0.0' }, spec: { mount: { mountPath: '/', landingPage: 'd' } } },
      validManifest,
    ]);
    const prompts = makePrompts();
    let validateCall = 0;
    const mcp = makeMcp({
      validate: async () => {
        validateCall += 1;
        if (validateCall === 1) {
          return { valid: false, errors: [{ field: 'apiVersion', message: 'must be ikary.co/v1alpha1' }] };
        }
        return { valid: true, errors: [] };
      },
    });
    const executor = new SystemAiManifestTaskExecutor(runner as never, prompts as never, mcp as never);

    const result = await executor.execute(baseInput);

    expect(result.manifest).toEqual(validManifest);
    expect(result.error).toBeUndefined();
    expect((runner as unknown as { runTask: { mock: { calls: { 0: { taskId: string; metadata?: Record<string, unknown> } }[] } } }).runTask.mock.calls).toHaveLength(2);
    expect((runner as unknown as { runTask: { mock: { calls: { 0: { taskId: string; metadata?: Record<string, unknown> } }[] } } }).runTask.mock.calls[1]![0].taskId).toBe('manifest.fix');
  });

  it('falls back to in-code Zod validation when the MCP client throws', async () => {
    process.env.MANIFEST_VALIDATION_MAX_FIX_ATTEMPTS = '0';
    const runner = makeRunner([validManifest]);
    const prompts = makePrompts();
    const mcp = makeMcp({
      validate: async () => {
        throw new Error('ECONNREFUSED');
      },
    });
    const executor = new SystemAiManifestTaskExecutor(runner as never, prompts as never, mcp as never);

    const result = await executor.execute(baseInput);

    expect(result.manifest).toEqual(validManifest);
    expect(result.error).toBeUndefined();
  });

  it('honors MANIFEST_VALIDATION_MAX_FIX_ATTEMPTS=0 and returns failure on first invalid manifest', async () => {
    process.env.MANIFEST_VALIDATION_MAX_FIX_ATTEMPTS = '0';
    const broken = { apiVersion: 'wrong' };
    const runner = makeRunner([broken]);
    const prompts = makePrompts();
    const mcp = makeMcp({
      validate: async () => ({ valid: false, errors: [{ field: 'apiVersion', message: 'literal mismatch' }] }),
    });
    const executor = new SystemAiManifestTaskExecutor(runner as never, prompts as never, mcp as never);

    const result = await executor.execute(baseInput);

    expect(result.manifest).toEqual(broken);
    expect(result.error).toMatch(/Manifest failed mcp validation/);
    expect((runner as unknown as { runTask: { mock: { calls: unknown[][] } } }).runTask.mock.calls).toHaveLength(1);
  });
});
