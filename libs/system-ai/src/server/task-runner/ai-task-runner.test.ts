import { describe, expect, it, vi } from 'vitest';
import { AiTaskRunner } from './ai-task-runner.service';
import { RateLimitedException } from '../providers/rate-limited-exception';
import type { AiProvider, GenerateChatInput, GenerateChatOutput } from '../../shared/provider.interface';
import type { ResolvedProvider } from '../providers/provider.router';

function makeProvider(impl: (input: GenerateChatInput) => Promise<GenerateChatOutput>): AiProvider {
  return {
    name: 'fake',
    generateChat: vi.fn(impl),
    streamChat: vi.fn(async function* () { yield ''; }),
    tokenCount: (text: string) => text.length,
  };
}

function makeRouter(provider: AiProvider, model = 'fake-model') {
  return {
    resolveChainForTask: () => [{
      provider,
      providerName: 'fake-provider',
      model,
      profile: 'test',
    }] as ResolvedProvider[],
    resolveForTask: () => ({
      provider,
      providerName: 'fake-provider',
      model,
      profile: 'test',
    } as ResolvedProvider),
  } as unknown as ConstructorParameters<typeof AiTaskRunner>[0];
}

const baseInput = {
  taskId: 'manifest.create',
  systemPrompt: 'sys',
  promptPayload: 'hello',
};

describe('AiTaskRunner rate-limit handling', () => {
  it('waits for Retry-After then retries the same model on RateLimitedException', async () => {
    process.env.AI_RATE_LIMIT_RETRY_AFTER_MAX_MS = '5000';
    process.env.AI_RATE_LIMIT_MAX_RETRIES_SAME_MODEL = '2';

    let calls = 0;
    const start = Date.now();
    const provider = makeProvider(async () => {
      calls += 1;
      if (calls === 1) {
        throw new RateLimitedException({
          message: 'fake: HTTP 429 - rate limit',
          provider: 'fake-provider',
          retryAfterMs: 200,
          headers: { tokensRemaining: 0, retryAfterMs: 200 },
        });
      }
      return {
        text: 'ok',
        inputTokens: 1,
        outputTokens: 1,
        model: 'fake-model',
        provider: 'fake-provider',
        latencyMs: 0,
      };
    });
    const runner = new AiTaskRunner(makeRouter(provider));

    const result = await runner.runTask(baseInput);
    const elapsed = Date.now() - start;

    expect(calls).toBe(2);
    expect(elapsed).toBeGreaterThanOrEqual(150);
    expect(result.text).toBe('ok');
    expect(result.trace.attempts).toHaveLength(2);
    expect(result.trace.attempts[0]?.status).toBe('rate_limited');
    expect(result.trace.attempts[0]?.waitedMs).toBe(200);
    expect(result.trace.attempts[1]?.status).toBe('succeeded');
  });

  it('rotates immediately when Retry-After exceeds AI_RATE_LIMIT_RETRY_AFTER_MAX_MS', async () => {
    process.env.AI_RATE_LIMIT_RETRY_AFTER_MAX_MS = '100';
    process.env.AI_RATE_LIMIT_MAX_RETRIES_SAME_MODEL = '5';

    const provider = makeProvider(async () => {
      throw new RateLimitedException({
        message: 'fake: HTTP 429 - rate limit',
        provider: 'fake-provider',
        retryAfterMs: 60_000,
      });
    });
    const runner = new AiTaskRunner(makeRouter(provider));

    await expect(runner.runTask(baseInput)).rejects.toMatchObject({
      response: expect.objectContaining({ message: expect.stringContaining('429') }),
    });
    // Single chain step; one attempt recorded as rate_limited then we surface failure.
    // No same-model retry should have happened because the wait is too long.
    const calls = (provider.generateChat as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(calls).toBe(1);
  });

  it('propagates cache and header telemetry from the provider into the attempt trace', async () => {
    process.env.AI_RATE_LIMIT_RETRY_AFTER_MAX_MS = '5000';
    const provider = makeProvider(async () => ({
      text: 'ok',
      inputTokens: 100,
      outputTokens: 50,
      cacheReadTokens: 1800,
      cacheWriteTokens: 0,
      model: 'fake-model',
      provider: 'fake-provider',
      latencyMs: 5,
      headers: { tokensRemaining: 49000, tokensReset: '2026-04-17T16:00:00Z' },
    }));
    const runner = new AiTaskRunner(makeRouter(provider));
    const result = await runner.runTask(baseInput);

    const attempt = result.trace.attempts[0]!;
    expect(attempt.cacheReadTokens).toBe(1800);
    expect(attempt.cacheWriteTokens).toBe(0);
    expect(attempt.headers?.tokensRemaining).toBe(49000);
  });
});
